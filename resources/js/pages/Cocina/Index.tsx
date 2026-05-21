import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanBoard } from '@/components/Kanban';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { useCocinaKDS, type PedidoCocina } from '@/hooks/useCocinaKDS';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ChefHat, Clock, Kanban, LayoutList, Lock, RefreshCw } from 'lucide-react';
import { ChangeEvent, useState, useEffect, useMemo } from 'react';

const COCINA_VISTA_KEY = 'cocina:vista';

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

    const [vista, setVista] = useState<'kds' | 'kanban'>(() => {
        const saved = localStorage.getItem(COCINA_VISTA_KEY);
        return saved === 'kanban' ? 'kanban' : 'kds';
    });
    const [query, setQuery] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendientes' | 'preparacion' | 'retrasados'>('todos');

    useEffect(() => {
        localStorage.setItem(COCINA_VISTA_KEY, vista);
    }, [vista]);

    const filteredPedidos = useMemo(() => {
        const q = query.trim().toLowerCase();

        return pedidos.filter((pedido) => {
            const matchesText = [
                pedido.id.toString(),
                pedido.mesa_nombre,
                pedido.productos.map((producto) => producto.nombre).join(' '),
                pedido.notas || '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(q);

            if (q && !matchesText) {
                return false;
            }

            if (filtroStatus === 'pendientes') {
                return pedido.estado === 'pendiente' || pedido.estado === 'confirmado';
            }

            if (filtroStatus === 'preparacion') {
                return pedido.estado === 'en_preparacion';
            }

            if (filtroStatus === 'retrasados') {
                return pedido.tiempo_transcurrido > 20;
            }

            return true;
        });
    }, [pedidos, query, filtroStatus]);

    const pendientes = filteredPedidos.filter((p) => p.estado === 'pendiente' || p.estado === 'confirmado');
    const enPreparacion = filteredPedidos.filter((p) => p.estado === 'en_preparacion');
    const retrasados = filteredPedidos.filter((p) => p.tiempo_transcurrido > 20);
    const totalPedidos = filteredPedidos.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Cocina" />

            <div className="min-h-screen space-y-6 p-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                        <div className="rounded-3xl bg-orange-600 p-4 shadow-lg shadow-orange-950/20">
                            <ChefHat className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Panel de Cocina</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                                Visualiza los pedidos en curso, filtra por estado y mueve los platillos entre preparación y listo con una experiencia más ordenada.
                            </p>
                            {requirePaymentBeforePreparation && (
                                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-50/70 px-3 py-1 text-sm text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300">
                                    <Lock className="h-4 w-4" />
                                    Solo se muestran pedidos pagados
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setVista('kds')}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                                    vista === 'kds'
                                        ? 'bg-orange-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                                }`}
                            >
                                <LayoutList className="h-4 w-4" />
                                KDS
                            </button>
                            <button
                                onClick={() => setVista('kanban')}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                                    vista === 'kanban'
                                        ? 'bg-orange-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
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
                            className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refrescar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-orange-100 bg-orange-50/80 dark:border-orange-950/20 dark:bg-orange-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Pedidos activos</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{totalPedidos}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pedidos visibles en el tablero</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-100 bg-yellow-50/80 dark:border-yellow-950/20 dark:bg-yellow-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-700">Pendientes</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{pendientes.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pedidos nuevos y confirmados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sky-100 bg-sky-50/80 dark:border-sky-950/20 dark:bg-sky-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">En preparación</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{enPreparacion.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pedidos en curso</p>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-100 bg-rose-50/80 dark:border-rose-950/20 dark:bg-rose-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Retrasados</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{retrasados.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pedidos con tiempo elevado</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] items-center">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Buscar y filtrar</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Encuentra un pedido rápido por mesa, número, producto o nota.</p>
                        </div>
                        <div className="space-y-3">
                            <Input
                                value={query}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                                placeholder="Buscar pedidos por mesa, plato o nota..."
                                className="h-11 rounded-2xl bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                            />
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'todos', label: 'Todos' },
                                    { key: 'pendientes', label: 'Pendientes' },
                                    { key: 'preparacion', label: 'En preparación' },
                                    { key: 'retrasados', label: 'Retrasados' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFiltroStatus(item.key as typeof filtroStatus)}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            filtroStatus === item.key
                                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950'
                                                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-500 bg-rose-50/80 p-4 text-rose-700">
                        {error}
                    </div>
                )}

                {actionError && (
                    <div className="rounded-2xl border border-amber-500 bg-amber-50/80 p-4 text-amber-800">
                        {actionError}
                    </div>
                )}

                {vista === 'kanban' && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                        <KanbanBoard area="kitchen" pollingInterval={10} />
                    </div>
                )}

                {vista === 'kds' && (
                    <>
                        {loading && pedidos.length === 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-64 w-full dark:bg-slate-800" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-2xl border border-yellow-200 bg-yellow-50/80 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Nuevos Pedidos ({pendientes.length})</h2>
                                    </div>

                                    {pendientes.length === 0 ? (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-400" />
                                            <p className="mt-3 text-slate-500 dark:text-slate-400">Sin pedidos nuevos</p>
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

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-800 dark:bg-sky-950/20">
                                        <ChefHat className="h-5 w-5 text-sky-600" />
                                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">En Preparación ({enPreparacion.length})</h2>
                                    </div>

                                    {enPreparacion.length === 0 ? (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                            <ChefHat className="mx-auto h-12 w-12 text-slate-400" />
                                            <p className="mt-3 text-slate-500 dark:text-slate-400">Sin pedidos en preparación</p>
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

                        {!loading && pedidos.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                <ChefHat className="mx-auto h-20 w-20 text-slate-400" />
                                <h3 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">¡Todo al día!</h3>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">No hay pedidos activos en este momento</p>
                            </div>
                        )}
                    </>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
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
            className={`rounded-2xl border p-5 transition-all shadow-sm ${
                isBlocked
                    ? 'border-slate-700 bg-slate-950/80 opacity-90'
                    : isCritical
                      ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40 shadow-red-900/10'
                      : isDelayed
                        ? 'border-yellow-500 bg-yellow-50/80 dark:bg-yellow-950/30'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
            }`}
        >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Pedido #{pedido.id}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{pedido.mesa_nombre}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <PagoBadge payment_status={pedido.payment_status} />
                        {isBlocked && (
                            <Badge className="rounded-full bg-slate-700 px-2 py-1 text-[11px] text-slate-100">
                                <Lock className="mr-1 h-3 w-3" />
                                Esperando pago
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
                            isCritical
                                ? 'bg-red-600 text-white'
                                : isDelayed
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        {pedido.tiempo_transcurrido} min
                    </div>
                    {isCritical && !isBlocked && (
                        <Badge className="rounded-full bg-red-600 px-2 py-1 text-[11px] text-white">
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

