import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../layouts/authenticated-layout';
import { useAdminPedidos } from '../../hooks/useAdminPedidos';
import PedidoCard from '../../components/Pedidos/PedidoCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { RefreshCw, Search } from 'lucide-react';

interface PageProps {
    filters?: {
        estado?: string;
        mesa_id?: number;
    };
}

export default function Index({ filters }: PageProps) {
    const [filtroEstado, setFiltroEstado] = useState<string>(filters?.estado || 'all');
    const [busqueda, setBusqueda] = useState('');

    const {
        pedidos,
        loading,
        error,
        refetch,
        cambiarEstado,
        cambiandoEstado,
    } = useAdminPedidos({
        estado: filtroEstado !== 'all' ? filtroEstado : undefined,
    });

    const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        await cambiarEstado(pedidoId, nuevoEstado);
    };

    // Agrupar pedidos por estado
    const pedidosPorEstado = {
        pendiente: pedidos.filter(p => p.estado === 'pendiente'),
        confirmado: pedidos.filter(p => p.estado === 'confirmado'),
        en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion'),
        listo: pedidos.filter(p => p.estado === 'listo'),
        entregado: pedidos.filter(p => p.estado === 'entregado'),
        pagado: pedidos.filter(p => p.estado === 'pagado'),
        cancelado: pedidos.filter(p => p.estado === 'cancelado'),
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Pedidos" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
                        <p className="text-gray-600 mt-1">
                            Gestiona los pedidos del restaurante en tiempo real
                        </p>
                    </div>

                    <Button onClick={refetch} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Buscar por mesa
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Nombre de mesa..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-64">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filtrar por estado
                            </label>
                            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="en_preparacion">En Preparación</SelectItem>
                                    <SelectItem value="listo">Listo</SelectItem>
                                    <SelectItem value="entregado">Entregado</SelectItem>
                                    <SelectItem value="pagado">Pagado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                            {pedidos.length} pedido(s)
                        </span>
                        {filtroEstado !== 'all' && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">
                                    Filtrado por: <span className="font-medium">{filtroEstado.replace('_', ' ')}</span>
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Loading state */}
                {loading && pedidos.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-48 w-full" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Pedidos agrupados por estado */}
                {!loading && pedidos.length > 0 && (
                    <div className="space-y-8">
                        {filtroEstado === 'all' ? (
                            // Vista agrupada por estado
                            <>
                                {Object.entries(pedidosPorEstado).map(([estado, pedidosEstado]) => {
                                    if (pedidosEstado.length === 0) return null;

                                    const estadoLabels: Record<string, string> = {
                                        pendiente: 'Pendientes',
                                        confirmado: 'Confirmados',
                                        en_preparacion: 'En Preparación',
                                        listo: 'Listos',
                                        entregado: 'Entregados',
                                        pagado: 'Pagados',
                                        cancelado: 'Cancelados',
                                    };

                                    return (
                                        <div key={estado}>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                {estadoLabels[estado]} ({pedidosEstado.length})
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {pedidosEstado.map((pedido) => (
                                                    <PedidoCard
                                                        key={pedido.id}
                                                        pedido={pedido}
                                                        onCambiarEstado={handleCambiarEstado}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            // Vista de lista simple con filtro
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pedidos.map((pedido) => (
                                    <PedidoCard
                                        key={pedido.id}
                                        pedido={pedido}
                                        onCambiarEstado={handleCambiarEstado}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!loading && pedidos.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay pedidos
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {filtroEstado !== 'all'
                                ? 'No se encontraron pedidos con este estado'
                                : 'Aún no hay pedidos registrados'}
                        </p>
                        {filtroEstado !== 'all' && (
                            <Button onClick={() => setFiltroEstado('all')} variant="outline">
                                Ver todos los pedidos
                            </Button>
                        )}
                    </div>
                )}

                {/* Auto-refresh indicator */}
                <p className="text-center text-sm text-gray-500">
                    Los pedidos se actualizan automáticamente cada 30 segundos
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
