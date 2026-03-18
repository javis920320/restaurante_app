import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, Clock, Package, RefreshCw, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reportes', href: '/reportes' },
];

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

interface ReportesData {
    ventas_por_hora: VentaPorHora[];
    productos_mas_vendidos: ProductoMasVendido[];
    total_pedidos_dia: number;
    tiempo_promedio_preparacion: number;
    ventas_totales?: number;
}

export default function Index() {
    const today = new Date().toISOString().split('T')[0];
    const [fechaInicio, setFechaInicio] = useState(today);
    const [fechaFin, setFechaFin] = useState(today);
    const [reportes, setReportes] = useState<ReportesData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReportes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ReportesData>('/api/admin/dashboard/reportes', {
                params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
            });
            setReportes(response.data);
        } catch (err) {
            setError('Error al cargar los reportes. Por favor intente nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin]);

    useEffect(() => {
        fetchReportes();
    }, [fetchReportes]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

    const totalVentas = reportes?.ventas_por_hora?.reduce((sum, v) => sum + v.total_ventas, 0) ?? 0;
    const maxVenta = Math.max(...(reportes?.ventas_por_hora?.map((v) => v.total_ventas) ?? [0]));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes y Analítica" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Reportes y Analítica
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Análisis del rendimiento del negocio
                        </p>
                    </div>
                </div>

                {/* Date Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="space-y-2">
                                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                                <Input
                                    id="fecha_inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    max={today}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                                <Input
                                    id="fecha_fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    max={today}
                                    min={fechaInicio}
                                />
                            </div>
                            <Button onClick={fetchReportes} disabled={loading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Cargando...' : 'Aplicar Filtros'}
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setFechaInicio(today);
                                        setFechaFin(today);
                                    }}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const d = new Date();
                                        d.setDate(d.getDate() - 7);
                                        setFechaInicio(d.toISOString().split('T')[0]);
                                        setFechaFin(today);
                                    }}
                                >
                                    7 días
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const d = new Date();
                                        d.setDate(1);
                                        setFechaInicio(d.toISOString().split('T')[0]);
                                        setFechaFin(today);
                                    }}
                                >
                                    Este mes
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : reportes ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(totalVentas)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos</p>
                                            <p className="text-2xl font-bold">{reportes.total_pedidos_dia}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Ticket Promedio
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {reportes.total_pedidos_dia > 0
                                                    ? formatCurrency(totalVentas / reportes.total_pedidos_dia)
                                                    : '$0'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Tiempo Promedio
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {reportes.tiempo_promedio_preparacion} min
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Products most sold */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos Más Vendidos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportes.productos_mas_vendidos.length > 0 ? (
                                        <div className="space-y-3">
                                            {reportes.productos_mas_vendidos.map((producto, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="w-8 justify-center text-xs"
                                                    >
                                                        #{idx + 1}
                                                    </Badge>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {producto.producto}
                                                            </span>
                                                            <span className="text-sm font-semibold text-green-600">
                                                                {formatCurrency(producto.ventas)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                                    style={{
                                                                        width: `${
                                                                            reportes.productos_mas_vendidos[0]
                                                                                ?.cantidad > 0
                                                                                ? (producto.cantidad /
                                                                                      reportes
                                                                                          .productos_mas_vendidos[0]
                                                                                          .cantidad) *
                                                                                  100
                                                                                : 0
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="w-16 text-right text-xs text-gray-500">
                                                                {producto.cantidad} uds
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="py-8 text-center text-gray-500">
                                            No hay datos de ventas para este período
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sales by hour */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Ventas por Hora
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportes.ventas_por_hora.length > 0 ? (
                                        <div className="space-y-2">
                                            {reportes.ventas_por_hora.map((venta, idx) => {
                                                const percentage =
                                                    maxVenta > 0 ? (venta.total_ventas / maxVenta) * 100 : 0;
                                                return (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <span className="w-14 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {venta.hora.toString().padStart(2, '0')}:00
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                                                <div
                                                                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-2 text-xs font-medium text-white transition-all duration-500"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        minWidth: percentage > 0 ? '48px' : '0',
                                                                    }}
                                                                >
                                                                    {percentage > 15 &&
                                                                        `${venta.total_pedidos} ped.`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="w-28 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(venta.total_ventas)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="py-8 text-center text-gray-500">
                                            No hay datos de ventas por hora para este período
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : null}
            </div>
        </AppLayout>
    );
}
