import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanBoard } from '@/components/Kanban';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { useBarKDS, type PedidoBar } from '@/hooks/useBarKDS';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, GlassWater, Kanban, LayoutList, Lock, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

const BAR_VISTA_KEY = 'bar:vista';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bar', href: '/bar' },
];

interface Props {
    requirePaymentBeforePreparation?: boolean;
}

export default function Index({ requirePaymentBeforePreparation = false }: Props) {
    const { pedidos, loading, error, actionError, marcarListo, marcarEnPreparacion, refetch } = useBarKDS({
        pollingInterval: 10,
    });

    const [vista, setVista] = useState<'kds' | 'kanban'>(() => {
        const saved = localStorage.getItem(BAR_VISTA_KEY);
        return saved === 'kanban' ? 'kanban' : 'kds';
    });

    useEffect(() => {
        localStorage.setItem(BAR_VISTA_KEY, vista);
    }, [vista]);

    const pendientes = pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'confirmado');
    const enPreparacion = pedidos.filter((p) => p.estado === 'en_preparacion');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Bar" />

            <div className="min-h-screen space-y-6 bg-gray-950 p-6 text-white">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-700 p-3">
                            <GlassWater className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Panel de Bar</h1>
                            <p className="text-gray-400">
                                {pedidos.length} pedido(s) activo(s) • Actualización automática cada 10s
                            </p>
                            {requirePaymentBeforePreparation && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-yellow-400">
                                    <Lock className="h-4 w-4" />
                                    Solo se muestran pedidos pagados
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex rounded-lg border border-gray-600 overflow-hidden">
                            <button
                                onClick={() => setVista('kds')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                                    vista === 'kds'
                                        ? 'bg-purple-700 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <LayoutList className="h-4 w-4" />
                                KDS
                            </button>
                            <button
                                onClick={() => setVista('kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                                    vista === 'kanban'
                                        ? 'bg-purple-700 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <Kanban className="h-4 w-4" />
                                Kanban
                            </button>
                        </div>
                        <Button
                            onClick={refetch}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-500 bg-red-950 p-4">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {actionError && (
                    <div className="rounded-lg border border-yellow-500 bg-yellow-950 p-4">
                        <p className="text-yellow-300">{actionError}</p>
                    </div>
                )}

                {/* Kanban view */}
                {vista === 'kanban' && (
                    <div className="rounded-xl bg-gray-900 p-4">
                        <KanbanBoard area="bar" pollingInterval={10} />
                    </div>
                )}

                {/* KDS view */}
                {vista === 'kds' && (
                    <>
                        {loading && pedidos.length === 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-64 w-full bg-gray-800" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Nuevos / Confirmados */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-yellow-900 px-4 py-2">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                        <h2 className="text-lg font-bold text-yellow-300">
                                            Nuevos Pedidos ({pendientes.length})
                                        </h2>
                                    </div>

                                    {pendientes.length === 0 ? (
                                        <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                                            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-600" />
                                            <p className="mt-3 text-gray-500">Sin pedidos nuevos</p>
                                        </div>
                                    ) : (
                                        pendientes.map((pedido) => (
                                            <PedidoBarCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onItemAccion={(detalleId) => marcarEnPreparacion(pedido.id, detalleId)}
                                                accionLabel="▶ Iniciar"
                                                accionColor="bg-blue-600 hover:bg-blue-700"
                                                requirePaymentBeforePreparation={requirePaymentBeforePreparation}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* En Preparación */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-purple-900 px-4 py-2">
                                        <GlassWater className="h-5 w-5 text-purple-400" />
                                        <h2 className="text-lg font-bold text-purple-300">
                                            En Preparación ({enPreparacion.length})
                                        </h2>
                                    </div>

                                    {enPreparacion.length === 0 ? (
                                        <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                                            <GlassWater className="mx-auto h-12 w-12 text-gray-600" />
                                            <p className="mt-3 text-gray-500">Sin pedidos en preparación</p>
                                        </div>
                                    ) : (
                                        enPreparacion.map((pedido) => (
                                            <PedidoBarCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onItemAccion={(detalleId) => marcarListo(pedido.id, detalleId)}
                                                accionLabel="✓ Listo"
                                                accionColor="bg-green-600 hover:bg-green-700"
                                                requirePaymentBeforePreparation={requirePaymentBeforePreparation}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && pedidos.length === 0 && (
                            <div className="rounded-xl border border-gray-700 bg-gray-900 py-20 text-center">
                                <GlassWater className="mx-auto h-20 w-20 text-gray-700" />
                                <h3 className="mt-4 text-2xl font-bold text-gray-400">¡Todo al día!</h3>
                                <p className="mt-2 text-gray-500">No hay pedidos activos en el bar</p>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                    Panel de Bar • Restaurante App • Actualización automática cada 10 segundos
                </div>
            </div>
        </AppLayout>
    );
}

interface PedidoBarCardProps {
    pedido: PedidoBar;
    onItemAccion: (detalleId: number) => Promise<void>;
    accionLabel: string;
    accionColor: string;
    requirePaymentBeforePreparation: boolean;
}

function PedidoBarCard({ pedido, onItemAccion, accionLabel, accionColor, requirePaymentBeforePreparation }: PedidoBarCardProps) {
    const isDelayed = pedido.tiempo_transcurrido > 10;
    const isCritical = pedido.tiempo_transcurrido > 20;
    const isBlocked = requirePaymentBeforePreparation && pedido.payment_status !== 'paid';

    return (
        <div
            className={`rounded-xl border p-5 transition-all ${
                isBlocked
                    ? 'border-gray-600 bg-gray-900/50 opacity-75'
                    : isCritical
                      ? 'border-red-500 bg-red-950/50 shadow-lg shadow-red-900/30'
                      : isDelayed
                        ? 'border-yellow-600 bg-yellow-950/30'
                        : 'border-gray-700 bg-gray-900'
            }`}
        >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Pedido #{pedido.id}</h3>
                    <p className="text-lg text-gray-300">{pedido.mesa_nombre}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                        <PagoBadge payment_status={pedido.payment_status} />
                        {isBlocked && (
                            <Badge className="bg-gray-700 text-xs text-gray-300">
                                <Lock className="mr-1 h-3 w-3" />
                                Esperando pago
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                            isCritical
                                ? 'bg-red-600 text-white'
                                : isDelayed
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        {pedido.tiempo_transcurrido} min
                    </div>
                    {isCritical && !isBlocked && (
                        <Badge className="bg-red-600 text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Demorado
                        </Badge>
                    )}
                </div>
            </div>

            {/* Bar items with per-item actions */}
            <div className="mb-4 space-y-2">
                {pedido.productos.map((producto) => (
                    <BarItemRow
                        key={producto.id}
                        producto={producto}
                        onAccion={() => onItemAccion(producto.id)}
                        accionLabel={accionLabel}
                        accionColor={accionColor}
                        blocked={isBlocked}
                    />
                ))}
            </div>

            {/* Order notes */}
            {pedido.notas && (
                <div className="rounded-lg border border-yellow-800 bg-yellow-950/50 px-3 py-2">
                    <p className="text-sm text-yellow-300">
                        <span className="font-bold">📋 Nota:</span> {pedido.notas}
                    </p>
                </div>
            )}

            {isBlocked && (
                <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 py-2 text-sm font-bold text-gray-500">
                    <Lock className="h-4 w-4" />
                    Pendiente de pago en caja
                </div>
            )}
        </div>
    );
}

interface BarItemRowProps {
    producto: PedidoBar['productos'][0];
    onAccion: () => Promise<void>;
    accionLabel: string;
    accionColor: string;
    blocked: boolean;
}

function BarItemRow({ producto, onAccion, accionLabel, accionColor, blocked }: BarItemRowProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const isDone = producto.estado === 'listo' || producto.estado === 'entregado';

    const handleAccion = async () => {
        setIsUpdating(true);
        try {
            await onAccion();
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-800 px-3 py-2">
            <div className="flex-1">
                <span className="font-medium text-white">{producto.nombre}</span>
                {producto.notas && (
                    <p className="mt-1 text-xs text-yellow-400 italic">📝 {producto.notas}</p>
                )}
                <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        producto.estado === 'listo'
                            ? 'bg-green-700 text-green-100'
                            : producto.estado === 'en_preparacion'
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-gray-600 text-gray-200'
                    }`}
                >
                    {producto.estado === 'listo'
                        ? '✓ Listo'
                        : producto.estado === 'en_preparacion'
                          ? '⏳ Preparando'
                          : '⏱ Pendiente'}
                </span>
            </div>
            <span className="rounded-full bg-gray-700 px-2 py-0.5 text-sm font-bold text-white">
                x{producto.cantidad}
            </span>
            {!isDone && !blocked && (
                <button
                    onClick={handleAccion}
                    disabled={isUpdating}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold text-white transition-all ${accionColor} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {isUpdating ? '⏳' : accionLabel}
                </button>
            )}
            {!isDone && blocked && (
                <Lock className="h-4 w-4 text-gray-500" />
            )}
        </div>
    );
}

