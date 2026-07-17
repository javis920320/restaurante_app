import { KanbanBoard } from '@/components/Kanban';
import PedidoCard from '@/components/Pedidos/PedidoCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminPedidos } from '@/hooks/useAdminPedidos';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChefHat, Clock3, GlassWater, Kanban, LayoutList, Plus, RefreshCw, Search, X } from 'lucide-react';
import React from 'react';

const PEDIDOS_VISTA_KEY = 'pedidos:vista';
const ESTADOS_ORDEN = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado'] as const;
const ESTADOS_LABELS: Record<string, string> = {
    pendiente: 'Pendientes',
    confirmado: 'Confirmados',
    en_preparacion: 'En Preparación',
    listo: 'Listos',
    entregado: 'Entregados',
    pagado: 'Pagados',
    cancelado: 'Cancelados',
};
const ESTADO_FILTER_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'confirmado', label: 'Confirmados' },
    { value: 'en_preparacion', label: 'En Preparación' },
    { value: 'listo', label: 'Listos' },
    { value: 'entregado', label: 'Entregados' },
    { value: 'pagado', label: 'Pagados' },
    { value: 'cancelado', label: 'Cancelados' },
] as const;

const FECHA_FILTER_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'semana', label: 'Últimos 7 días' },
] as const;

type EstadoFilter = (typeof ESTADO_FILTER_OPTIONS)[number]['value'];
type FechaFilter = (typeof FECHA_FILTER_OPTIONS)[number]['value'];

interface PageProps {
    filters?: {
        estado?: string;
        mesa_id?: number;
        fecha?: 'hoy' | 'ayer' | 'semana';
    };
}

export default function Index({ filters }: PageProps) {
    const [filtroEstado, setFiltroEstado] = React.useState<EstadoFilter>((filters?.estado as EstadoFilter) || 'all');
    const [busqueda, setBusqueda] = React.useState('');
    const [vista, setVista] = React.useState<'lista' | 'kanban' | 'tabla'>(() => {
        if (typeof window === 'undefined') return 'lista';
        const saved = window.localStorage.getItem(PEDIDOS_VISTA_KEY);
        return saved === 'kanban' || saved === 'tabla' ? saved : 'lista';
    });
    const [areaKanban, setAreaKanban] = React.useState<'kitchen' | 'bar'>('kitchen');
    const [fechaFiltro, setFechaFiltro] = React.useState<FechaFilter>((filters?.fecha as FechaFilter) || 'all');
    const [pagina, setPagina] = React.useState<number>(1);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(PEDIDOS_VISTA_KEY, vista);
        }
    }, [vista]);

    React.useEffect(() => {
        setPagina(1);
    }, [filtroEstado, busqueda, fechaFiltro]);

    const { pedidos, loading, error, refetch, cambiarEstado, currentPage, lastPage, total } = useAdminPedidos({
        estado: filtroEstado !== 'all' ? filtroEstado : undefined,
        fecha: fechaFiltro !== 'all' ? fechaFiltro : undefined,
        page: pagina,
    });

    const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        await cambiarEstado(pedidoId, nuevoEstado);
    };

    const pedidosFiltrados = React.useMemo(() => {
        const term = busqueda.trim().toLowerCase();

        return pedidos.filter((pedido) => {
            if (filtroEstado !== 'all' && pedido.estado !== filtroEstado) {
                return false;
            }

            if (!term) return true;

            const searchableValues = [
                pedido.mesa?.nombre ?? '',
                `mesa ${pedido.mesa_id}`,
                `pedido ${pedido.id}`,
                pedido.cliente ?? '',
                pedido.notas ?? '',
            ];

            return searchableValues.some((value) => value.toLowerCase().includes(term));
        });
    }, [pedidos, busqueda, filtroEstado]);

    const paginaActual = currentPage;
    const paginasTotales = lastPage;

    const pedidosPorEstado = React.useMemo(() => {
        return ESTADOS_ORDEN.reduce(
            (acc, estado) => {
                acc[estado] = pedidosFiltrados.filter((pedido) => pedido.estado === estado);
                return acc;
            },
            {} as Record<(typeof ESTADOS_ORDEN)[number], typeof pedidosFiltrados>,
        );
    }, [pedidosFiltrados]);

    const stats = React.useMemo(() => {
        const total = pedidos.length;
        const pendientes = pedidos.filter((pedido) => pedido.estado === 'pendiente').length;
        const enProduccion = pedidos.filter((pedido) => ['confirmado', 'en_preparacion'].includes(pedido.estado)).length;
        const listos = pedidos.filter((pedido) => pedido.estado === 'listo').length;
        const cerrados = pedidos.filter((pedido) => ['entregado', 'pagado'].includes(pedido.estado)).length;
        return { total, pendientes, enProduccion, listos, cerrados };
    }, [pedidos]);

    return (
        <AppLayout>
            <Head title="Gestión de Pedidos" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                            Gestión de Pedidos <Clock3 className="h-6 w-6 text-indigo-500" />
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Controla el flujo de pedidos en tiempo real con vista por estados y tablero operativo.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-0.5 rounded-xl bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
                            <button
                                onClick={() => setVista('lista')}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                                    vista === 'lista'
                                        ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <LayoutList className="h-4 w-4" />
                                Lista
                            </button>
                            <button
                                onClick={() => setVista('kanban')}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                                    vista === 'kanban'
                                        ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <Kanban className="h-4 w-4" />
                                Kanban
                            </button>
                        </div>
                        <Button
                            asChild
                            className="h-11 rounded-xl bg-indigo-600 px-5 font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 dark:shadow-none"
                        >
                            <Link href="/pedidos/crear">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Pedido
                            </Link>
                        </Button>
                        <Button onClick={refetch} variant="outline" className="h-11 rounded-xl border-slate-200 px-4 font-semibold">
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-4 dark:border-indigo-950/40 dark:bg-indigo-950/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900">
                                <LayoutList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                    Total pedidos
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-amber-150 rounded-2xl border bg-amber-50/10 p-4 dark:border-amber-950/40 dark:bg-amber-950/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900">
                                <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">Pendientes</p>
                                <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.pendientes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-blue-150 rounded-2xl border bg-blue-50/10 p-4 dark:border-blue-950/40 dark:bg-blue-950/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900">
                                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">En producción</p>
                                <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.enProduccion}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-emerald-150 rounded-2xl border bg-emerald-50/10 p-4 dark:border-emerald-950/40 dark:bg-emerald-950/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">Listos</p>
                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.listos}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/20 p-4 dark:border-slate-800 dark:bg-slate-900/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                                <RefreshCw className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Cerrados</p>
                                <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{stats.cerrados}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {vista === 'kanban' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                            <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Seleccionar estación de trabajo</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAreaKanban('kitchen')}
                                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                        areaKanban === 'kitchen'
                                            ? 'border-orange-200 bg-orange-500 text-white dark:border-orange-800'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                    }`}
                                >
                                    <ChefHat className="h-4 w-4" />
                                    Cocina
                                </button>
                                <button
                                    onClick={() => setAreaKanban('bar')}
                                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                        areaKanban === 'bar'
                                            ? 'border-cyan-200 bg-cyan-600 text-white dark:border-cyan-800'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                    }`}
                                >
                                    <GlassWater className="h-4 w-4" />
                                    Bar
                                </button>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <KanbanBoard area={areaKanban} pollingInterval={10} />
                        </div>
                    </div>
                )}

                {(vista === 'lista' || vista === 'tabla') && (
                    <>
                        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar por mesa, pedido o notas..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            className="h-11 rounded-xl border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950"
                                        />
                                        {busqueda && (
                                            <button
                                                onClick={() => setBusqueda('')}
                                                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Filtrar por estado</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ESTADO_FILTER_OPTIONS.map((estado) => (
                                            <button
                                                key={estado.value}
                                                onClick={() => setFiltroEstado(estado.value)}
                                                className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                                                    filtroEstado === estado.value
                                                        ? 'border-indigo-600 bg-indigo-600 font-semibold text-white shadow-xs shadow-indigo-100 dark:shadow-none'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                                }`}
                                            >
                                                {estado.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Filtrar por fecha</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {FECHA_FILTER_OPTIONS.map((fecha) => (
                                            <button
                                                key={fecha.value}
                                                onClick={() => setFechaFiltro(fecha.value)}
                                                className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                                                    fechaFiltro === fecha.value
                                                        ? 'border-indigo-600 bg-indigo-600 font-semibold text-white shadow-xs shadow-indigo-100 dark:shadow-none'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                                                }`}
                                            >
                                                {fecha.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/50 pt-2 text-xs text-slate-500 dark:border-slate-800/50 dark:text-slate-400">
                                <span>{pedidosFiltrados.length} pedido(s) visibles</span>
                                {(filtroEstado !== 'all' || busqueda || fechaFiltro !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setFiltroEstado('all');
                                            setBusqueda('');
                                            setFechaFiltro('all');
                                        }}
                                        className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                                {error}
                            </div>
                        )}

                        {loading && pedidos.length === 0 && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-64 w-full rounded-2xl" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && pedidosFiltrados.length > 0 && (
                            <div className="space-y-8">
                                {vista === 'tabla' ? (
                                    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                            <thead className="bg-slate-50 text-left text-xs tracking-[0.2em] text-slate-500 uppercase dark:bg-slate-900 dark:text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3">Pedido</th>
                                                    <th className="px-4 py-3">Mesa</th>
                                                    <th className="px-4 py-3">Cliente</th>
                                                    <th className="px-4 py-3">Estado</th>
                                                    <th className="px-4 py-3">Total</th>
                                                    <th className="px-4 py-3">Fecha</th>
                                                    <th className="px-4 py-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                                {pedidosFiltrados.map((pedido) => (
                                                    <tr key={pedido.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                                                        <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">#{pedido.id}</td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                                            {pedido.mesa?.nombre ?? `Mesa ${pedido.mesa_id}`}
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{pedido.cliente ?? '-'}</td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                                            <Badge
                                                                variant="secondary"
                                                                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
                                                            >
                                                                {ESTADOS_LABELS[pedido.estado] ?? pedido.estado}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">${pedido.total.toFixed(2)}</td>
                                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                                                            {new Date(pedido.created_at).toLocaleString('es-ES', {
                                                                dateStyle: 'short',
                                                                timeStyle: 'short',
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Link
                                                                href={`/pedidos/${pedido.id}`}
                                                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                                            >
                                                                Ver
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : filtroEstado === 'all' ? (
                                    <>
                                        {ESTADOS_ORDEN.map((estado) => {
                                            const pedidosEstado = pedidosPorEstado[estado];
                                            if (pedidosEstado.length === 0) return null;

                                            return (
                                                <section key={estado} className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                            {ESTADOS_LABELS[estado]}
                                                        </h2>
                                                        <Badge
                                                            variant="secondary"
                                                            className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                                        >
                                                            {pedidosEstado.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                        {pedidosEstado.map((pedido) => (
                                                            <PedidoCard key={pedido.id} pedido={pedido} onCambiarEstado={handleCambiarEstado} />
                                                        ))}
                                                    </div>
                                                </section>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {pedidosFiltrados.map((pedido) => (
                                            <PedidoCard key={pedido.id} pedido={pedido} onCambiarEstado={handleCambiarEstado} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && pedidosFiltrados.length === 0 && (
                            <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/20 p-12 text-center dark:border-slate-800">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                    <Search className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No se encontraron pedidos</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {busqueda
                                        ? 'No se encontraron pedidos para ese criterio de búsqueda.'
                                        : filtroEstado !== 'all'
                                          ? `No hay pedidos en estado ${filtroEstado.replace('_', ' ')}.`
                                          : 'Todavía no hay pedidos registrados.'}
                                </p>
                                {(filtroEstado !== 'all' || busqueda) && (
                                    <Button
                                        onClick={() => {
                                            setFiltroEstado('all');
                                            setBusqueda('');
                                        }}
                                        variant="outline"
                                        className="mt-4 rounded-xl border-slate-200 hover:bg-slate-50"
                                    >
                                        Ver todos los pedidos
                                    </Button>
                                )}
                            </div>
                        )}

                        {paginasTotales > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                <span className="mr-2 text-xs tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">Página</span>
                                {Array.from({ length: paginasTotales }, (_, index) => index + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === paginaActual ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPagina(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                    de {paginasTotales} • {total} pedidos
                                </span>
                            </div>
                        )}
                    </>
                )}

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">Los pedidos se actualizan automáticamente cada 30 segundos.</p>
            </div>
        </AppLayout>
    );
}
