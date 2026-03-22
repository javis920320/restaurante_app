<?php

namespace App\Services;

use App\Models\HistorialEstadoPedido;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Mesa;
use App\Models\Plato;
use App\Events\PedidoCreado;
use App\Events\PedidoEstadoActualizado;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PedidoService
{
    protected MesaService $mesaService;

    public function __construct(MesaService $mesaService)
    {
        $this->mesaService = $mesaService;
    }

    /**
     * Crear un pedido desde QR
     *
     * @param string $qrToken
     * @param array $items [['producto_id' => int, 'cantidad' => int, 'notas' => string], ...]
     * @param int|null $clienteId
     * @param string|null $notas
     * @return Pedido
     * @throws Exception
     */
    public function crearPedidoDesdeQR(
        string $qrToken,
        array $items,
        ?int $clienteId = null,
        ?string $notas = null
    ): Pedido {
        // Validar token de mesa
        $mesa = $this->mesaService->validarToken($qrToken);

        return DB::transaction(function () use ($mesa, $items, $clienteId, $notas) {
            // Crear pedido
            $pedido = Pedido::create([
                'mesa_id' => $mesa->id,
                'cliente_id' => $clienteId,
                'user_id' => null, // Se asignará cuando lo confirme un empleado
                'estado' => 'pendiente',
                'subtotal' => 0,
                'total' => 0,
                'notas' => $notas,
                'canal' => 'qr',
            ]);

            $this->agregarItemsAlPedido($pedido, $items, $mesa->restaurante_id);

            // Ocupar la mesa si no está ocupada
            if ($mesa->estado === 'disponible') {
                $this->mesaService->ocuparMesa($mesa);
            }

            // Registrar en historial
            $this->registrarHistorial($pedido, null, 'pendiente', null, 'qr');

            // Disparar evento
            event(new PedidoCreado($pedido));

            Log::info('Pedido creado desde QR', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $mesa->id,
                'total' => $pedido->total,
            ]);

            return $pedido->load('detalles.producto', 'mesa');
        });
    }

    /**
     * Crear un pedido asistido por mesero
     *
     * @param int $mesaId
     * @param array $items [['producto_id' => int, 'cantidad' => int, 'notas' => string], ...]
     * @param int $userId
     * @param int|null $clienteId
     * @param string|null $notas
     * @return Pedido
     * @throws Exception
     */
    public function crearPedidoMesero(
        int $mesaId,
        array $items,
        int $userId,
        ?int $clienteId = null,
        ?string $notas = null
    ): Pedido {
        $mesa = Mesa::activas()->findOrFail($mesaId);

        if (!$mesa->restaurante || !$mesa->restaurante->activo) {
            throw new Exception('El restaurante no está disponible actualmente.');
        }

        return DB::transaction(function () use ($mesa, $items, $userId, $clienteId, $notas) {
            $pedido = Pedido::create([
                'mesa_id' => $mesa->id,
                'cliente_id' => $clienteId,
                'user_id' => $userId,
                'estado' => 'pendiente',
                'subtotal' => 0,
                'total' => 0,
                'notas' => $notas,
                'canal' => 'mesero',
            ]);

            $this->agregarItemsAlPedido($pedido, $items, $mesa->restaurante_id);

            // Ocupar la mesa si no está ocupada
            if ($mesa->estado === 'disponible') {
                $this->mesaService->ocuparMesa($mesa);
            }

            // Registrar en historial
            $this->registrarHistorial($pedido, null, 'pendiente', $userId, 'mesero');

            // Disparar evento
            event(new PedidoCreado($pedido));

            Log::info('Pedido creado por mesero', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $mesa->id,
                'user_id' => $userId,
                'total' => $pedido->total,
            ]);

            return $pedido->load('detalles.producto', 'mesa');
        });
    }

    /**
     * Agrega items a un pedido y recalcula totales
     *
     * @param Pedido $pedido
     * @param array $items
     * @param int $restauranteId
     * @throws Exception
     */
    protected function agregarItemsAlPedido(Pedido $pedido, array $items, int $restauranteId): void
    {
        $subtotal = 0;

        foreach ($items as $item) {
            $producto = Plato::activos()
                ->where('id', $item['producto_id'])
                ->where(function ($q) use ($restauranteId) {
                    $q->where('restaurante_id', $restauranteId)
                        ->orWhereNull('restaurante_id');
                })
                ->first();

            if (!$producto) {
                throw new Exception("El producto seleccionado (ID: {$item['producto_id']}) no está disponible en este restaurante.");
            }

            $cantidad = (int) $item['cantidad'];
            $precioUnitario = $producto->precio;
            $subtotalItem = $precioUnitario * $cantidad;

            PedidoDetalle::create([
                'pedido_id' => $pedido->id,
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'precio_unitario' => $precioUnitario,
                'subtotal' => $subtotalItem,
                'notas' => $item['notas'] ?? null,
                'production_area' => $producto->production_area ?? 'none',
                'estado' => 'pendiente',
            ]);

            $subtotal += $subtotalItem;
        }

        $pedido->update([
            'subtotal' => $subtotal,
            'total' => $subtotal,
        ]);
    }

    /**
     * Registrar un cambio de estado en el historial
     *
     * @param Pedido $pedido
     * @param string|null $estadoAnterior
     * @param string $estadoNuevo
     * @param int|null $userId
     * @param string|null $canal
     */
    protected function registrarHistorial(
        Pedido $pedido,
        ?string $estadoAnterior,
        string $estadoNuevo,
        ?int $userId,
        ?string $canal = null
    ): void {
        HistorialEstadoPedido::create([
            'pedido_id' => $pedido->id,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
            'user_id' => $userId,
            'canal' => $canal,
        ]);
    }

    /**
     * Cambiar el estado de un pedido
     *
     * @param Pedido $pedido
     * @param string $nuevoEstado
     * @param int|null $userId
     * @return Pedido
     * @throws Exception
     */
    public function cambiarEstado(Pedido $pedido, string $nuevoEstado, ?int $userId = null): Pedido
    {
        $estadosValidos = Pedido::ESTADOS_OPERATIVOS;

        if (!in_array($nuevoEstado, $estadosValidos)) {
            throw new Exception('Estado inválido: ' . $nuevoEstado);
        }

        // Validate state transitions (operational states only – 'pagado' is now payment_status)
        $transicionesPermitidas = [
            'pendiente'     => ['confirmado', 'en_preparacion', 'cancelado'],
            'confirmado'    => ['en_preparacion', 'cancelado'],
            'en_preparacion' => ['listo', 'cancelado'],
            'listo'         => ['entregado'],
            'entregado'     => ['cancelado'],
            'cancelado'     => [], // Terminal state
        ];

        $estadoActual = $pedido->estado;

        // Check if transition is allowed
        if (!in_array($nuevoEstado, $transicionesPermitidas[$estadoActual] ?? [])) {
            throw new Exception("No se puede cambiar de estado '{$estadoActual}' a '{$nuevoEstado}'");
        }

        return DB::transaction(function () use ($pedido, $nuevoEstado, $userId) {
            $estadoAnterior = $pedido->estado;

            $pedido->update([
                'estado' => $nuevoEstado,
                'user_id' => $userId ?? $pedido->user_id,
            ]);

            // Registrar en historial de estados
            $this->registrarHistorial($pedido, $estadoAnterior, $nuevoEstado, $userId);

            // Disparar evento
            event(new PedidoEstadoActualizado($pedido, $estadoAnterior, $nuevoEstado));

            Log::info('Estado de pedido actualizado', [
                'pedido_id'      => $pedido->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo'   => $nuevoEstado,
                'user_id'        => $userId,
            ]);

            return $pedido->fresh();
        });
    }

    /**
     * Calcular el total de un pedido
     *
     * @param Pedido $pedido
     * @return array
     */
    public function calcularTotal(Pedido $pedido): array
    {
        $subtotal = $pedido->detalles->sum('subtotal');
        $total = $subtotal; // Aquí se pueden agregar impuestos, propinas, etc.

        return [
            'subtotal' => $subtotal,
            'total' => $total,
        ];
    }

    /**
     * Cambiar el estado de un ítem individual de pedido
     *
     * @param PedidoDetalle $detalle
     * @param string $nuevoEstado
     * @return PedidoDetalle
     * @throws Exception
     */
    public function cambiarEstadoDetalle(PedidoDetalle $detalle, string $nuevoEstado): PedidoDetalle
    {
        $estadosValidos = PedidoDetalle::ESTADOS;

        if (!in_array($nuevoEstado, $estadosValidos)) {
            throw new Exception('Estado de ítem inválido: ' . $nuevoEstado);
        }

        $transicionesPermitidas = [
            'pendiente'      => ['en_preparacion'],
            'en_preparacion' => ['listo'],
            'listo'          => ['entregado'],
            'entregado'      => [],
        ];

        $estadoActual = $detalle->estado;

        if (!in_array($nuevoEstado, $transicionesPermitidas[$estadoActual] ?? [])) {
            throw new Exception("No se puede cambiar el estado del ítem de '{$estadoActual}' a '{$nuevoEstado}'");
        }

        // Enforce payment-before-preparation rule when moving to 'en_preparacion'
        if ($nuevoEstado === 'en_preparacion' && config('restaurant.require_payment_before_preparation')) {
            $pedido = $detalle->pedido;
            if (!$pedido->estaPagado()) {
                throw new Exception('El pedido debe estar pagado antes de iniciar la preparación.');
            }
        }

        return DB::transaction(function () use ($detalle, $nuevoEstado, $estadoActual) {
            $detalle->update(['estado' => $nuevoEstado]);

            Log::info('Estado de ítem de pedido actualizado', [
                'detalle_id'      => $detalle->id,
                'pedido_id'       => $detalle->pedido_id,
                'estado_anterior' => $estadoActual,
                'estado_nuevo'    => $nuevoEstado,
            ]);

            // Automatically advance the parent order status based on the
            // aggregate state of all production-area items.
            $this->sincronizarEstadoPedido($detalle->pedido_id);

            return $detalle->fresh();
        });
    }

    /**
     * Automatically advance the pedido's operational estado to reflect the
     * aggregate estado of its production-area (kitchen / bar) items.
     *
     * Rules:
     *  - Any item in 'en_preparacion' + pedido in 'pendiente'|'confirmado'
     *      → advance pedido to 'en_preparacion'
     *  - All items in 'listo' or 'entregado' + pedido in 'en_preparacion'
     *      → advance pedido to 'listo'
     *  - All items in 'entregado' + pedido in 'listo'
     *      → advance pedido to 'entregado'
     *
     * Items with production_area 'none' are excluded from the calculation
     * because they never flow through the kitchen / bar Kanban boards.
     *
     * @param int $pedidoId
     */
    protected function sincronizarEstadoPedido(int $pedidoId): void
    {
        $pedido = Pedido::find($pedidoId);

        if (!$pedido) {
            return;
        }

        $estadoActual = $pedido->estado;

        // Nothing to do if the order is already in a terminal state.
        if (in_array($estadoActual, ['entregado', 'cancelado'])) {
            return;
        }

        // Only consider items assigned to a production area.
        $itemsConArea = PedidoDetalle::where('pedido_id', $pedidoId)
            ->whereIn('production_area', ['kitchen', 'bar'])
            ->get();

        if ($itemsConArea->isEmpty()) {
            return;
        }

        $hayEnPreparacion     = $itemsConArea->contains(fn($d) => $d->estado === 'en_preparacion');
        $todosListosOEntregados = $itemsConArea->every(fn($d) => in_array($d->estado, ['listo', 'entregado']));
        $todosEntregados      = $itemsConArea->every(fn($d) => $d->estado === 'entregado');

        $nuevoEstado = null;

        if ($hayEnPreparacion && in_array($estadoActual, ['pendiente', 'confirmado'])) {
            $nuevoEstado = 'en_preparacion';
        } elseif ($todosListosOEntregados && $estadoActual === 'en_preparacion') {
            $nuevoEstado = 'listo';
        } elseif ($todosEntregados && $estadoActual === 'listo') {
            $nuevoEstado = 'entregado';
        }

        if ($nuevoEstado !== null) {
            $this->cambiarEstado($pedido, $nuevoEstado, null);
        }
    }

    /**
     * Marcar un pedido como pagado (sin liberar la mesa).
     * Utilizado por el rol "caja".
     *
     * @param Pedido $pedido
     * @param int $userId
     * @return Pedido
     * @throws Exception
     */
    public function markAsPaid(Pedido $pedido, int $userId): Pedido
    {
        if ($pedido->payment_status === 'paid') {
            throw new Exception('El pedido ya está marcado como pagado.');
        }

        return DB::transaction(function () use ($pedido, $userId) {
            $pedido->update([
                'payment_status' => 'paid',
                'user_id'        => $userId,
            ]);

            Log::info('Pedido marcado como pagado', [
                'pedido_id' => $pedido->id,
                'total'     => $pedido->total,
                'user_id'   => $userId,
            ]);

            return $pedido->fresh();
        });
    }

    /**
     * Cerrar una mesa (marcar pedido como pagado y liberar mesa).
     *
     * @param Pedido $pedido
     * @param int $userId
     * @return Pedido
     * @throws Exception
     */
    public function cerrarMesa(Pedido $pedido, int $userId): Pedido
    {
        return DB::transaction(function () use ($pedido, $userId) {
            // Mark payment as paid (financial axis)
            $pedido->update([
                'payment_status' => 'paid',
                'user_id'        => $userId,
            ]);

            // Move operational state to entregado if not already in a terminal state
            if (in_array($pedido->estado, ['pendiente', 'confirmado', 'en_preparacion', 'listo'])) {
                $this->cambiarEstado($pedido, 'entregado', $userId);
            }

            // Liberar la mesa
            $this->mesaService->liberarMesa($pedido->mesa);

            Log::info('Mesa cerrada', [
                'pedido_id' => $pedido->id,
                'mesa_id'   => $pedido->mesa_id,
                'total'     => $pedido->total,
                'user_id'   => $userId,
            ]);

            return $pedido->fresh();
        });
    }
}
