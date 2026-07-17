import { KanbanBoard } from '@/components/Kanban';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCocinaKDS, type PedidoCocina } from '@/hooks/useCocinaKDS';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, CheckCircle2, ChefHat, Clock, Kanban, LayoutList, Lock, Play, RefreshCw } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

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
                <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 xl:flex-row xl:items-start xl:justify-between dark:border-slate-800">
                    <div className="flex items-start gap-4">
                        <div className="rounded-3xl bg-orange-600 p-4 shadow-lg shadow-orange-950/20">
                            <ChefHat className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Panel de Cocina</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                                Visualiza los pedidos en curso, filtra por estado y mueve los platillos entre preparación y listo con una experiencia
                                más ordenada.
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
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
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
                            <p className="text-xs font-semibold tracking-[0.16em] text-orange-600 uppercase">Pedidos activos</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{totalPedidos}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos visibles en el tablero</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-100 bg-yellow-50/80 dark:border-yellow-950/20 dark:bg-yellow-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold tracking-[0.16em] text-yellow-700 uppercase">Pendientes</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{pendientes.length}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos nuevos y confirmados</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sky-100 bg-sky-50/80 dark:border-sky-950/20 dark:bg-sky-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold tracking-[0.16em] text-sky-700 uppercase">En preparación</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{enPreparacion.length}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos en curso</p>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-100 bg-rose-50/80 dark:border-rose-950/20 dark:bg-rose-950/10">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold tracking-[0.16em] text-rose-700 uppercase">Retrasados</p>
                            <p className="text-3xl font-black text-slate-950 dark:text-white">{retrasados.length}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos con tiempo elevado</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="grid items-center gap-4 lg:grid-cols-[1.5fr_1fr]">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">Buscar y filtrar</p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Encuentra un pedido rápido por mesa, número, producto o nota.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Input
                                value={query}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                                placeholder="Buscar pedidos por mesa, plato o nota..."
                                className="h-11 rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

                {error && <div className="rounded-2xl border border-rose-500 bg-rose-50/80 p-4 text-rose-700">{error}</div>}

                {actionError && <div className="rounded-2xl border border-amber-500 bg-amber-50/80 p-4 text-amber-800">{actionError}</div>}

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
                                    <div className="flex items-center justify-between rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-transparent p-4 shadow-sm dark:border-amber-900/30 dark:from-amber-950/20">
                                        <div className="flex items-center gap-2.5">
                                            <span className="relative flex h-3 w-3">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
                                            </span>
                                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Nuevos Pedidos</h2>
                                        </div>
                                        <Badge className="rounded-2xl bg-amber-500 px-3 py-1 font-extrabold text-white shadow-sm shadow-amber-500/10 dark:bg-amber-600">
                                            {pendientes.length}
                                        </Badge>
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
                                    <div className="flex items-center justify-between rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50/80 to-transparent p-4 shadow-sm dark:border-sky-900/30 dark:from-sky-950/20">
                                        <div className="flex items-center gap-2.5">
                                            <ChefHat className="h-5 w-5 animate-bounce text-sky-600 dark:text-sky-400" />
                                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">En Preparación</h2>
                                        </div>
                                        <Badge className="rounded-2xl bg-sky-600 px-3 py-1 font-extrabold text-white shadow-sm shadow-sky-500/10 dark:bg-sky-500">
                                            {enPreparacion.length}
                                        </Badge>
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
            className={`rounded-3xl border p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                isBlocked
                    ? 'border-slate-200 bg-slate-50/80 opacity-90 dark:border-slate-800 dark:bg-slate-900/50'
                    : isCritical
                      ? 'border-red-300 bg-gradient-to-b from-red-50/50 to-white shadow-red-500/5 dark:border-red-950/30 dark:from-red-950/10 dark:to-slate-950'
                      : isDelayed
                        ? 'border-amber-300 bg-gradient-to-b from-amber-50/50 to-white shadow-amber-500/5 dark:border-amber-950/30 dark:from-amber-950/10 dark:to-slate-950'
                        : 'border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950'
            }`}
        >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        Pedido <span className="text-orange-600 dark:text-orange-500">#{pedido.id}</span>
                    </h3>
                    <p className="mt-1 text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                        Mesa: <span className="font-bold text-slate-700 dark:text-slate-300">{pedido.mesa_nombre}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <PagoBadge payment_status={pedido.payment_status} />
                        {isBlocked && (
                            <Badge className="dark:border-slate-750 rounded-full border border-slate-300/50 bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <Lock className="mr-1 h-3.5 w-3.5" />
                                Esperando Pago
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <div
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition-colors ${
                            isCritical
                                ? 'border-red-500/25 bg-red-500/10 text-red-500'
                                : isDelayed
                                  ? 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                    >
                        <Clock className={`h-3.5 w-3.5 ${isDelayed || isCritical ? 'animate-pulse' : ''}`} />
                        <span>{pedido.tiempo_transcurrido}m</span>
                        {(isDelayed || isCritical) && !isBlocked && (
                            <span className="relative flex h-2 w-2">
                                <span
                                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`}
                                ></span>
                                <span className={`relative inline-flex h-2 w-2 rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="mb-5 space-y-2.5">
                {pedido.productos.map((producto, idx) => {
                    const isDone = producto.estado === 'listo';
                    const isPrep = producto.estado === 'en_preparacion';

                    return (
                        <div
                            key={idx}
                            className={`flex items-start justify-between rounded-2xl border p-3 transition-all duration-200 ${
                                isDone
                                    ? 'border-slate-100/50 bg-slate-50/30 opacity-60 dark:border-slate-900/30 dark:bg-slate-950/20'
                                    : isPrep
                                      ? 'border-blue-100 bg-blue-500/5 shadow-sm shadow-blue-500/2 dark:border-blue-900/30 dark:bg-blue-950/10'
                                      : 'border-slate-100 bg-slate-50/70 dark:border-slate-800/50 dark:bg-slate-900/60'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-colors ${
                                        isDone
                                            ? 'border-slate-200/45 bg-slate-100 text-slate-400 dark:border-slate-800/40 dark:bg-slate-900 dark:text-slate-600'
                                            : 'border-orange-200/50 bg-orange-100 text-orange-700 dark:border-orange-900/30 dark:bg-orange-950/45 dark:text-orange-300'
                                    }`}
                                >
                                    {producto.cantidad}x
                                </span>
                                <div className="min-w-0">
                                    <p
                                        className={`text-sm leading-tight font-semibold text-slate-800 dark:text-slate-100 ${isDone ? 'dark:text-slate-650 text-slate-400 line-through' : ''}`}
                                    >
                                        {producto.nombre}
                                    </p>
                                    {producto.notas && (
                                        <p className="mt-1 text-xs font-medium text-amber-600 italic dark:text-amber-400">📝 {producto.notas}</p>
                                    )}
                                    <div className="mt-1.5">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${
                                                isDone
                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                                                    : isPrep
                                                      ? 'border-blue-500/20 bg-blue-500/10 text-blue-600'
                                                      : 'border-slate-200/60 bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                                            }`}
                                        >
                                            {isDone ? (
                                                <>
                                                    <Check className="h-2.5 w-2.5" />
                                                    Listo
                                                </>
                                            ) : isPrep ? (
                                                <>
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                                                    Preparando
                                                </>
                                            ) : (
                                                <>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                                                    Pendiente
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Order notes */}
            {pedido.notas && (
                <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200/40 bg-amber-50/40 p-3 text-xs dark:border-amber-950/30 dark:bg-amber-950/15">
                    <span className="text-sm text-amber-500 dark:text-amber-400">📋</span>
                    <div className="leading-normal font-medium text-amber-800 dark:text-amber-300">
                        <span className="mb-0.5 block text-[9px] font-bold tracking-wider text-amber-500 uppercase">Nota del Pedido</span>
                        {pedido.notas}
                    </div>
                </div>
            )}

            {/* Action button */}
            {isBlocked ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 py-3.5 text-sm font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-600">
                    <Lock className="h-4 w-4" />
                    Pendiente de pago en caja
                </div>
            ) : (
                <button
                    onClick={handleAccion}
                    disabled={isUpdating}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.98] ${accionColor} hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {isUpdating ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Actualizando...</span>
                        </>
                    ) : (
                        <>
                            {accionLabel.includes('Iniciar') ? <Play className="h-4 w-4 fill-current" /> : <Check className="h-4 w-4 stroke-[3]" />}
                            <span>{accionLabel.replace(/^[▶✓]\s*/, '')}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
