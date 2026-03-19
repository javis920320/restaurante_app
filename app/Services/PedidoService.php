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
        $estadosValidos = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado'];

        if (!in_array($nuevoEstado, $estadosValidos)) {
            throw new Exception('Estado inválido: ' . $nuevoEstado);
        }

        // Validate state transitions
        $transicionesPermitidas = [
            'pendiente' => ['confirmado', 'cancelado'],
            'confirmado' => ['en_preparacion', 'cancelado'],
            'en_preparacion' => ['listo', 'cancelado'],
            'listo' => ['entregado'],
            'entregado' => ['pagado'],
            'pagado' => [], // Terminal state
            'cancelado' => [], // Terminal state
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
                'pedido_id' => $pedido->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => $nuevoEstado,
                'user_id' => $userId,
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
     * Cerrar una mesa (marcar pedido como pagado y liberar mesa)
     *
     * @param Pedido $pedido
     * @param int $userId
     * @return Pedido
     * @throws Exception
     */
    public function cerrarMesa(Pedido $pedido, int $userId): Pedido
    {
        return DB::transaction(function () use ($pedido, $userId) {
            // Cambiar estado a pagado
            $this->cambiarEstado($pedido, 'pagado', $userId);

            // Liberar la mesa
            $this->mesaService->liberarMesa($pedido->mesa);

            Log::info('Mesa cerrada', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'total' => $pedido->total,
                'user_id' => $userId,
            ]);

            return $pedido->fresh();
        });
    }
}
