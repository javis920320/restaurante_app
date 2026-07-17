import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Clock, Package, ShoppingCart } from 'lucide-react';

interface VentaPorHora {
    hora: number;
    total_pedidos: number;
    total_ventas: number;
}

interface ProductoMasVendido {
    producto: string;
    cantidad: number;
    ventas: number;
}

interface QuickReportsProps {
    reportes: {
        ventas_por_hora: VentaPorHora[];
        productos_mas_vendidos: ProductoMasVendido[];
        total_pedidos_dia: number;
        tiempo_promedio_preparacion: number;
    } | null;
    loading: boolean;
}

export function QuickReports({ reportes, loading }: QuickReportsProps) {
    if (loading || !reportes) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Resumen del Día
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-slate-150 flex items-center justify-between rounded-2xl border bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Pedidos</span>
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{reportes.total_pedidos_dia}</span>
                    </div>

                    <div className="border-slate-150 flex items-center justify-between rounded-2xl border bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiempo Promedio</span>
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{reportes.tiempo_promedio_preparacion}m</span>
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Productos Más Vendidos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reportes.productos_mas_vendidos.length > 0 ? (
                        <div className="space-y-2">
                            {reportes.productos_mas_vendidos.slice(0, 5).map((producto, idx) => (
                                <div
                                    key={idx}
                                    className="border-slate-150 dark:border-slate-850 flex items-center justify-between rounded-2xl border bg-slate-50/30 p-3 transition-colors hover:bg-slate-50/80 dark:bg-slate-900/20 dark:hover:bg-slate-900/50"
                                >
                                    <div>
                                        <p className="text-slate-850 text-sm font-bold dark:text-slate-200">{producto.producto}</p>
                                        <p className="dark:text-slate-450 mt-0.5 text-xs font-medium text-slate-500">{producto.cantidad} unidades</p>
                                    </div>
                                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                        ${producto.ventas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-slate-400 dark:text-slate-500">No hay ventas registradas hoy</p>
                    )}
                </CardContent>
            </Card>

            {/* Sales by hour */}
            {reportes.ventas_por_hora.length > 0 && (
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Ventas por Hora</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3.5">
                            {reportes.ventas_por_hora.map((venta, idx) => {
                                const maxVenta = Math.max(...reportes.ventas_por_hora.map((v) => v.total_ventas));
                                const percentage = maxVenta > 0 ? (venta.total_ventas / maxVenta) * 100 : 0;

                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="w-16 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            {venta.hora.toString().padStart(2, '0')}:00
                                        </span>
                                        <div className="relative flex-1">
                                            <div className="h-9 overflow-hidden rounded-xl border border-slate-200/20 bg-slate-100 dark:border-slate-800/30 dark:bg-slate-900">
                                                <div
                                                    className="flex h-full items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 text-xs font-black text-white shadow-sm"
                                                    style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '60px' : '0' }}
                                                >
                                                    {percentage > 10 && `${venta.total_pedidos} pedidos`}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="w-28 text-right text-xs font-extrabold text-slate-900 dark:text-slate-50">
                                            ${venta.total_ventas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
