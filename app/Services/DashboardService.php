<?php

namespace App\Services;

use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    /**
     * Get orders for the kitchen display system
     * Returns pending, confirmed and in-preparation orders grouped with product details
     *
     * @return array
     */
    public function getPedidosParaCocina(): array
    {
        $estados = ['pendiente', 'confirmado', 'en_preparacion'];

        $pedidos = Pedido::with(['mesa', 'detalles.producto'])
            ->whereIn('estado', $estados)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'mesa_nombre' => $pedido->mesa ? $pedido->mesa->nombre : "Mesa #{$pedido->mesa_id}",
                    'estado' => $pedido->estado,
                    'tiempo_transcurrido' => $pedido->created_at->diffInMinutes(now()),
                    'notas' => $pedido->notas,
                    'created_at' => $pedido->created_at->toISOString(),
                    'productos' => $pedido->detalles->map(function ($detalle) {
                        return [
                            'nombre' => $detalle->producto->nombre,
                            'cantidad' => $detalle->cantidad,
                            'notas' => $detalle->notas ?? null,
                        ];
                    })->toArray(),
                ];
            });

        return $pedidos->toArray();
    }

    /**
     * Get main dashboard metrics
     * 
     * @return array
     */
    public function getMetrics(): array
    {
        // Cache metrics for 30 seconds to reduce DB load
        return Cache::remember('dashboard.metrics', 30, function () {
            // Count orders by status
            $pedidosPendientes = Pedido::where('estado', 'pendiente')->count();
            $pedidosEnPreparacion = Pedido::where('estado', 'en_preparacion')->count();
            $pedidosListos = Pedido::where('estado', 'listo')->count();

            // Count tables by status
            $mesasOcupadas = Mesa::where('estado', 'ocupada')->where('activa', true)->count();
            $mesasLibres = Mesa::where('estado', 'disponible')->where('activa', true)->count();

            // Today's sales
            $ventasDia = Pedido::whereDate('created_at', today())
                ->whereIn('estado', ['pagado'])
                ->sum('total');

            // Average ticket (paid orders today)
            $ticketPromedio = Pedido::whereDate('created_at', today())
                ->whereIn('estado', ['pagado'])
                ->avg('total') ?? 0;

            return [
                'pedidos_pendientes' => $pedidosPendientes,
                'pedidos_en_preparacion' => $pedidosEnPreparacion,
                'pedidos_listos' => $pedidosListos,
                'mesas_ocupadas' => $mesasOcupadas,
                'mesas_libres' => $mesasLibres,
                'ventas_dia' => round($ventasDia, 2),
                'ticket_promedio' => round($ticketPromedio, 2),
            ];
        });
    }

    /**
     * Get tables status with active orders
     * 
     * @return array
     */
    public function getMesasStatus(): array
    {
        $mesas = Mesa::where('activa', true)
            ->with(['pedidos' => function ($query) {
                $query->whereIn('estado', ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'])
                    ->orderBy('created_at', 'desc');
            }])
            ->get()
            ->map(function ($mesa) {
                $pedidosActivos = $mesa->pedidos;
                $totalAcumulado = $pedidosActivos->sum('total');
                
                // Calculate time occupied (from first active order)
                $tiempoOcupada = null;
                if ($pedidosActivos->count() > 0) {
                    $primerPedido = $pedidosActivos->last();
                    $tiempoOcupada = $primerPedido->created_at->diffInMinutes(now());
                }

                return [
                    'id' => $mesa->id,
                    'nombre' => $mesa->nombre,
                    'estado' => $mesa->estado,
                    'capacidad' => $mesa->capacidad,
                    'pedidos_activos' => $pedidosActivos->count(),
                    'total_acumulado' => round($totalAcumulado, 2),
                    'tiempo_ocupada' => $tiempoOcupada,
                ];
            });

        return $mesas->toArray();
    }

    /**
     * Get orders grouped by status (Kanban view)
     * 
     * @return array
     */
    public function getPedidosKanban(): array
    {
        $estados = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'];
        
        $pedidos = Pedido::with(['mesa', 'detalles.producto'])
            ->whereIn('estado', $estados)
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy('estado')
            ->map(function ($pedidosEstado) {
                return $pedidosEstado->map(function ($pedido) {
                    return [
                        'id' => $pedido->id,
                        'codigo' => $pedido->id,
                        'mesa' => [
                            'id' => $pedido->mesa->id,
                            'nombre' => $pedido->mesa->nombre,
                        ],
                        'estado' => $pedido->estado,
                        'total' => round($pedido->total, 2),
                        'created_at' => $pedido->created_at->toISOString(),
                        'tiempo_transcurrido' => $pedido->created_at->diffInMinutes(now()),
                        'productos_resumen' => $pedido->detalles->map(function ($detalle) {
                            return [
                                'nombre' => $detalle->producto->nombre,
                                'cantidad' => $detalle->cantidad,
                            ];
                        })->toArray(),
                    ];
                })->values()->toArray();
            });

        // Ensure all status columns exist, even if empty
        foreach ($estados as $estado) {
            if (!isset($pedidos[$estado])) {
                $pedidos[$estado] = [];
            }
        }

        return $pedidos->toArray();
    }

    /**
     * Get quick reports with optional date range filter
     *
     * @param string|null $fechaInicio
     * @param string|null $fechaFin
     * @return array
     */
    public function getReportes(?string $fechaInicio = null, ?string $fechaFin = null): array
    {
        $inicio = $fechaInicio ? \Carbon\Carbon::parse($fechaInicio)->startOfDay() : today()->startOfDay();
        $fin = $fechaFin ? \Carbon\Carbon::parse($fechaFin)->endOfDay() : today()->endOfDay();

        // Sales by hour in the date range
        $hourExpr = DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%H', created_at) AS INTEGER)"
            : 'HOUR(created_at)';

        $ventasPorHora = Pedido::whereBetween('created_at', [$inicio, $fin])
            ->whereIn('estado', ['pagado'])
            ->select(
                DB::raw($hourExpr . ' as hora'),
                DB::raw('COUNT(*) as total_pedidos'),
                DB::raw('SUM(total) as total_ventas')
            )
            ->groupBy(DB::raw($hourExpr))
            ->orderBy(DB::raw($hourExpr), 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'hora' => $item->hora,
                    'total_pedidos' => $item->total_pedidos,
                    'total_ventas' => round($item->total_ventas, 2),
                ];
            });

        // Top products sold in date range
        $productosMasVendidos = PedidoDetalle::whereHas('pedido', function ($query) use ($inicio, $fin) {
                $query->whereBetween('created_at', [$inicio, $fin])
                    ->whereIn('estado', ['pagado']);
            })
            ->with('producto')
            ->select(
                'producto_id',
                DB::raw('SUM(cantidad) as total_cantidad'),
                DB::raw('SUM(subtotal) as total_ventas')
            )
            ->groupBy('producto_id')
            ->orderBy('total_cantidad', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'producto' => $item->producto->nombre,
                    'cantidad' => $item->total_cantidad,
                    'ventas' => round($item->total_ventas, 2),
                ];
            });

        // Total orders in date range
        $totalPedidosDia = Pedido::whereBetween('created_at', [$inicio, $fin])->count();

        // Average preparation time
        // Note: assumes updated_at reflects when the order reached its final state
        $tiempoPromedioPreparacion = Pedido::whereBetween('created_at', [$inicio, $fin])
            ->whereIn('estado', ['listo', 'entregado', 'pagado'])
            ->get()
            ->map(function ($pedido) {
                return $pedido->created_at->diffInMinutes($pedido->updated_at);
            })
            ->avg() ?? 0;

        return [
            'ventas_por_hora' => $ventasPorHora->toArray(),
            'productos_mas_vendidos' => $productosMasVendidos->toArray(),
            'total_pedidos_dia' => $totalPedidosDia,
            'tiempo_promedio_preparacion' => round($tiempoPromedioPreparacion, 0),
        ];
    }
}
