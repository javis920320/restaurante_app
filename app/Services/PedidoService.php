<?php

namespace App\Services;

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
            ]);

            $subtotal = 0;

            // Agregar items al pedido
            foreach ($items as $item) {
                // Obtener producto y verificar que existe y está activo
                $producto = Plato::activos()
                    ->where('id', $item['producto_id'])
                    ->where('restaurante_id', $mesa->restaurante_id)
                    ->firstOrFail();

                $cantidad = (int) $item['cantidad'];
                $precioUnitario = $producto->precio;
                $subtotalItem = $precioUnitario * $cantidad;

                // Crear detalle del pedido
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

            // Actualizar totales del pedido
            $pedido->update([
                'subtotal' => $subtotal,
                'total' => $subtotal, // En el futuro se pueden agregar impuestos, descuentos, etc.
            ]);

            // Ocupar la mesa si no está ocupada
            if ($mesa->estado === 'disponible') {
                $this->mesaService->ocuparMesa($mesa);
            }

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

        return DB::transaction(function () use ($pedido, $nuevoEstado, $userId) {
            $estadoAnterior = $pedido->estado;

            $pedido->update([
                'estado' => $nuevoEstado,
                'user_id' => $userId ?? $pedido->user_id,
            ]);

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
