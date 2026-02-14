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
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Total Pedidos</span>
                        </div>
                        <span className="text-2xl font-bold">{reportes.total_pedidos_dia}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="font-medium">Tiempo Promedio</span>
                        </div>
                        <span className="text-2xl font-bold">{reportes.tiempo_promedio_preparacion} min</span>
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
                                <div key={idx} className="flex items-center justify-between rounded-lg border p-2">
                                    <div>
                                        <p className="font-medium">{producto.producto}</p>
                                        <p className="text-xs text-gray-600">{producto.cantidad} unidades</p>
                                    </div>
                                    <span className="font-semibold text-green-600">
                                        ${producto.ventas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-8 text-center text-gray-500">No hay ventas registradas hoy</p>
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
                        <div className="space-y-2">
                            {reportes.ventas_por_hora.map((venta, idx) => {
                                const maxVenta = Math.max(...reportes.ventas_por_hora.map((v) => v.total_ventas));
                                const percentage = maxVenta > 0 ? (venta.total_ventas / maxVenta) * 100 : 0;

                                return (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="w-16 text-sm font-medium text-gray-700">
                                            {venta.hora.toString().padStart(2, '0')}:00
                                        </span>
                                        <div className="relative flex-1">
                                            <div className="h-8 rounded-lg bg-gray-100">
                                                <div
                                                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 text-sm font-medium text-white"
                                                    style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '60px' : '0' }}
                                                >
                                                    {percentage > 10 && `${venta.total_pedidos} pedidos`}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="w-24 text-right text-sm font-semibold text-gray-900">
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
