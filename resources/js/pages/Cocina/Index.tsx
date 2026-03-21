import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanBoard } from '@/components/Kanban';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { useCocinaKDS, type PedidoCocina } from '@/hooks/useCocinaKDS';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ChefHat, Clock, Kanban, LayoutList, Lock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cocina', href: '/cocina' },
];

interface Props {
    requirePaymentBeforePreparation?: boolean;
}

export default function Index({ requirePaymentBeforePreparation = false }: Props) {
    const { pedidos, loading, error, actionError, marcarListo, marcarEnPreparacion, refetch } = useCocinaKDS({
        pollingInterval: 10,
    });

    const [vista, setVista] = useState<'kds' | 'kanban'>('kds');

    const pendientes = pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'confirmado');
    const enPreparacion = pedidos.filter((p) => p.estado === 'en_preparacion');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Cocina" />

            <div className="min-h-screen space-y-6 bg-gray-950 p-6 text-white">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-600 p-3">
                            <ChefHat className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Panel de Cocina</h1>
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
                                        ? 'bg-orange-600 text-white'
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
                                        ? 'bg-orange-600 text-white'
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
                        <KanbanBoard area="kitchen" pollingInterval={10} />
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
                                            <PedidoKDSCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onAccion={() => marcarEnPreparacion(pedido.id)}
                                                accionLabel="▶ Iniciar Preparación"
                                                accionColor="bg-blue-600 hover:bg-blue-700"
                                                requirePaymentBeforePreparation={requirePaymentBeforePreparation}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* En Preparación */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2">
                                        <ChefHat className="h-5 w-5 text-blue-400" />
                                        <h2 className="text-lg font-bold text-blue-300">
                                            En Preparación ({enPreparacion.length})
                                        </h2>
                                    </div>

                                    {enPreparacion.length === 0 ? (
                                        <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                                            <ChefHat className="mx-auto h-12 w-12 text-gray-600" />
                                            <p className="mt-3 text-gray-500">Sin pedidos en preparación</p>
                                        </div>
                                    ) : (
                                        enPreparacion.map((pedido) => (
                                            <PedidoKDSCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onAccion={() => marcarListo(pedido.id)}
                                                accionLabel="✓ Marcar como Listo"
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
                                <ChefHat className="mx-auto h-20 w-20 text-gray-700" />
                                <h3 className="mt-4 text-2xl font-bold text-gray-400">¡Todo al día!</h3>
                                <p className="mt-2 text-gray-500">No hay pedidos activos en este momento</p>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                    Panel de Cocina • Restaurante App • Actualización automática cada 10 segundos
                </div>
            </div>
        </AppLayout>
    );
}

interface PedidoKDSCardProps {
    pedido: PedidoCocina;
    onAccion: () => void;
    accionLabel: string;
    accionColor: string;
    requirePaymentBeforePreparation: boolean;
}

function PedidoKDSCard({ pedido, onAccion, accionLabel, accionColor, requirePaymentBeforePreparation }: PedidoKDSCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const isDelayed = pedido.tiempo_transcurrido > 20;
    const isCritical = pedido.tiempo_transcurrido > 35;
    const isBlocked = requirePaymentBeforePreparation && pedido.payment_status !== 'paid';

    const handleAccion = async () => {
        setIsUpdating(true);
        try {
            await onAccion();
        } finally {
            setIsUpdating(false);
        }
    };

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

            {/* Products */}
            <div className="mb-4 space-y-2">
                {pedido.productos.map((producto, idx) => (
                    <div
                        key={idx}
                        className="flex items-start justify-between rounded-lg bg-gray-800 px-3 py-2"
                    >
                        <div>
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
                        <span className="ml-2 rounded-full bg-gray-700 px-2 py-0.5 text-sm font-bold text-white">
                            x{producto.cantidad}
                        </span>
                    </div>
                ))}
            </div>

            {/* Order notes */}
            {pedido.notas && (
                <div className="mb-4 rounded-lg border border-yellow-800 bg-yellow-950/50 px-3 py-2">
                    <p className="text-sm text-yellow-300">
                        <span className="font-bold">📋 Nota:</span> {pedido.notas}
                    </p>
                </div>
            )}

            {/* Action button */}
            {isBlocked ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 py-3 text-base font-bold text-gray-500">
                    <Lock className="h-4 w-4" />
                    Pendiente de pago en caja
                </div>
            ) : (
                <button
                    onClick={handleAccion}
                    disabled={isUpdating}
                    className={`w-full rounded-lg py-3 text-base font-bold text-white transition-all ${accionColor} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {isUpdating ? '⏳ Actualizando...' : accionLabel}
                </button>
            )}
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cocina', href: '/cocina' },
];

export default function Index() {
    const { pedidos, loading, error, actionError, marcarListo, marcarEnPreparacion, refetch } = useCocinaKDS({
        pollingInterval: 10,
    });

    const [vista, setVista] = useState<'kds' | 'kanban'>('kds');

    const pendientes = pedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'confirmado');
    const enPreparacion = pedidos.filter((p) => p.estado === 'en_preparacion');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Cocina" />

            <div className="min-h-screen space-y-6 bg-gray-950 p-6 text-white">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-600 p-3">
                            <ChefHat className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Panel de Cocina</h1>
                            <p className="text-gray-400">
                                {pedidos.length} pedido(s) activo(s) • Actualización automática cada 10s
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex rounded-lg border border-gray-600 overflow-hidden">
                            <button
                                onClick={() => setVista('kds')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                                    vista === 'kds'
                                        ? 'bg-orange-600 text-white'
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
                                        ? 'bg-orange-600 text-white'
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
                        <KanbanBoard area="kitchen" pollingInterval={10} />
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
                                            <PedidoKDSCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onAccion={() => marcarEnPreparacion(pedido.id)}
                                                accionLabel="▶ Iniciar Preparación"
                                                accionColor="bg-blue-600 hover:bg-blue-700"
                                            />
                                        ))
                                    )}
                                </div>

                                {/* En Preparación */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2">
                                        <ChefHat className="h-5 w-5 text-blue-400" />
                                        <h2 className="text-lg font-bold text-blue-300">
                                            En Preparación ({enPreparacion.length})
                                        </h2>
                                    </div>

                                    {enPreparacion.length === 0 ? (
                                        <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                                            <ChefHat className="mx-auto h-12 w-12 text-gray-600" />
                                            <p className="mt-3 text-gray-500">Sin pedidos en preparación</p>
                                        </div>
                                    ) : (
                                        enPreparacion.map((pedido) => (
                                            <PedidoKDSCard
                                                key={pedido.id}
                                                pedido={pedido}
                                                onAccion={() => marcarListo(pedido.id)}
                                                accionLabel="✓ Marcar como Listo"
                                                accionColor="bg-green-600 hover:bg-green-700"
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && pedidos.length === 0 && (
                            <div className="rounded-xl border border-gray-700 bg-gray-900 py-20 text-center">
                                <ChefHat className="mx-auto h-20 w-20 text-gray-700" />
                                <h3 className="mt-4 text-2xl font-bold text-gray-400">¡Todo al día!</h3>
                                <p className="mt-2 text-gray-500">No hay pedidos activos en este momento</p>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                    Panel de Cocina • Restaurante App • Actualización automática cada 10 segundos
                </div>
            </div>
        </AppLayout>
    );
}

interface PedidoKDSCardProps {
    pedido: PedidoCocina;
    onAccion: () => void;
    accionLabel: string;
    accionColor: string;
}

function PedidoKDSCard({ pedido, onAccion, accionLabel, accionColor }: PedidoKDSCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const isDelayed = pedido.tiempo_transcurrido > 20;
    const isCritical = pedido.tiempo_transcurrido > 35;

    const handleAccion = async () => {
        setIsUpdating(true);
        try {
            await onAccion();
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div
            className={`rounded-xl border p-5 transition-all ${
                isCritical
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
                    {isCritical && (
                        <Badge className="bg-red-600 text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Demorado
                        </Badge>
                    )}
                </div>
            </div>

            {/* Products */}
            <div className="mb-4 space-y-2">
                {pedido.productos.map((producto, idx) => (
                    <div
                        key={idx}
                        className="flex items-start justify-between rounded-lg bg-gray-800 px-3 py-2"
                    >
                        <div>
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
                        <span className="ml-2 rounded-full bg-gray-700 px-2 py-0.5 text-sm font-bold text-white">
                            x{producto.cantidad}
                        </span>
                    </div>
                ))}
            </div>

            {/* Order notes */}
            {pedido.notas && (
                <div className="mb-4 rounded-lg border border-yellow-800 bg-yellow-950/50 px-3 py-2">
                    <p className="text-sm text-yellow-300">
                        <span className="font-bold">📋 Nota:</span> {pedido.notas}
                    </p>
                </div>
            )}

            {/* Action button */}
            <button
                onClick={handleAccion}
                disabled={isUpdating}
                className={`w-full rounded-lg py-3 text-base font-bold text-white transition-all ${accionColor} disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {isUpdating ? '⏳ Actualizando...' : accionLabel}
            </button>
        </div>
    );
}
