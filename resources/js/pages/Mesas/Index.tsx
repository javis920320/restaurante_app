import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { BreadcrumbItem, type Mesa } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Copy,
    Download,
    Edit,
    Plus,
    Printer,
    QrCode,
    RefreshCw,
    Search,
    ShieldAlert,
    Store,
    Table,
    Trash2,
    Wifi,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import FormularioMesa from './FormularioMesa';

interface Restaurante {
    id: number;
    nombre: string;
}

interface MesasIndexProps {
    mesas: {
        data: Mesa[];
        current_page: number;
        last_page: number;
        total: number;
    };
    restaurantes?: Restaurante[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mesas', href: '/configuracion/mesas' }];

export default function Index({ mesas, restaurantes = [] }: MesasIndexProps) {
    const mesasArray = mesas.data || [];

    // Local state for tables list
    const [listaMesas, setListaMesas] = useState<Mesa[]>(mesasArray);
    const [query, setQuery] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'disponibles' | 'ocupadas' | 'inactivas'>('todos');
    const [filtroRestaurante, setFiltroRestaurante] = useState<string>('todos');

    // Create & Edit drawer state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);

    // QR Code Dialog state
    const [qrMesa, setQrMesa] = useState<Mesa | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    // Delete Confirmation Dialog state
    const [deletingMesaId, setDeletingMesaId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);

    // Individual Loading States
    const [loadingEstado, setLoadingEstado] = useState<Record<number, boolean>>({});
    const [loadingActiva, setLoadingActiva] = useState<Record<number, boolean>>({});

    // Sync state when Inertia sends new props
    useEffect(() => {
        setListaMesas(mesas.data || []);
    }, [mesas.data]);

    // Fast Toggle: Availability (Libre/Ocupada)
    const toggleEstado = async (mesa: Mesa) => {
        setLoadingEstado((prev) => ({ ...prev, [mesa.id]: true }));
        try {
            await router.patch(
                route('mesas.cambiar-estado', mesa.id),
                {},
                {
                    onSuccess: () => {
                        // The list updates automatically from props sync
                    },
                    onFinish: () => {
                        setLoadingEstado((prev) => ({ ...prev, [mesa.id]: false }));
                    },
                },
            );
        } catch (error) {
            console.error(error);
            setLoadingEstado((prev) => ({ ...prev, [mesa.id]: false }));
        }
    };

    // Fast Toggle: Active Status (Activa/Inactiva)
    const toggleActiva = async (mesa: Mesa) => {
        setLoadingActiva((prev) => ({ ...prev, [mesa.id]: true }));
        try {
            await axios.put(route('mesas.update', mesa.id), {
                nombre: mesa.nombre,
                capacidad: mesa.capacidad,
                restaurante_id: mesa.restaurante_id,
                estado: mesa.estado,
                activa: !mesa.activa,
            });

            // Reload Inertia props to sync the new active status
            router.reload({
                only: ['mesas'],
                onFinish: () => {
                    setLoadingActiva((prev) => ({ ...prev, [mesa.id]: false }));
                },
            });
        } catch (error) {
            console.error(error);
            setLoadingActiva((prev) => ({ ...prev, [mesa.id]: false }));
        }
    };

    // AJAX: Delete Table
    const confirmarEliminarMesa = async () => {
        if (!deletingMesaId) return;
        setEliminandoId(deletingMesaId);
        try {
            await router.delete(route('mesas.destroy', deletingMesaId), {
                onSuccess: () => {
                    setDeletingMesaId(null);
                },
                onFinish: () => {
                    setEliminandoId(null);
                },
            });
        } catch (error) {
            console.error(error);
            setEliminandoId(null);
        }
    };

    // Form Triggers
    const abrirCrear = () => {
        setEditingMesa(null);
        setIsFormOpen(true);
    };

    const abrirEditar = (mesa: Mesa) => {
        setEditingMesa(mesa);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingMesa(null);
        router.reload({ only: ['mesas'] });
    };

    // QR Helper Functions
    const copyToken = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handlePrintQR = (mesa: Mesa) => {
        const qrUrl = route('mesas.generar-qr', mesa.id);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Imprimir QR - ${mesa.nombre}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
                        h1 { margin-bottom: 20px; font-size: 28px; font-weight: 800; color: #1e293b; }
                        img { width: 350px; height: 350px; border: 1px solid #e2e8f0; padding: 16px; border-radius: 24px; background: #fff; }
                        p { margin-top: 20px; font-size: 16px; color: #64748b; font-weight: 500; }
                    </style>
                </head>
                <body>
                    <h1>${mesa.nombre}</h1>
                    <img src="${qrUrl}" onload="window.print();" />
                    <p>Escanea para ver la carta y ordenar directamente</p>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownloadQR = async (mesa: Mesa) => {
        try {
            const response = await axios.get(route('mesas.generar-qr', mesa.id), { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `qr-${mesa.nombre.replace(/\s+/g, '-').toLowerCase()}.svg`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading QR', error);
        }
    };

    // Seating chart rendering helper (Creative premium feature)
    const renderVisualTable = (capacidad: number, estado: 'disponible' | 'ocupada', activa: boolean) => {
        const isOcupada = estado === 'ocupada';
        const isInactive = !activa;

        let tableBg = 'bg-emerald-500 dark:bg-emerald-600';
        let ringColor = 'ring-emerald-100 dark:ring-emerald-950/40';
        let chairBg = 'bg-emerald-600 dark:bg-emerald-500';

        if (isInactive) {
            tableBg = 'bg-slate-350 dark:bg-slate-700';
            ringColor = 'ring-slate-100 dark:ring-slate-900/50';
            chairBg = 'bg-slate-450 dark:bg-slate-600';
        } else if (isOcupada) {
            tableBg = 'bg-amber-500 dark:bg-amber-600';
            ringColor = 'ring-amber-100 dark:ring-amber-950/40';
            chairBg = 'bg-amber-600 dark:bg-amber-500';
        }

        const chairsCount = Math.min(capacidad, 10);
        const chairElements = [];

        for (let i = 0; i < chairsCount; i++) {
            const angle = (i * 360) / chairsCount;
            const style = {
                transform: `rotate(${angle}deg) translateY(-26px)`,
            };
            chairElements.push(
                <div
                    key={i}
                    style={style}
                    className={`absolute h-3 w-3 rounded-full ${chairBg} border border-white transition-all duration-300 dark:border-slate-950`}
                />,
            );
        }

        return (
            <div className="relative mx-auto my-4 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">{chairElements}</div>
                <div
                    className={`h-12 w-12 rounded-full ${tableBg} flex flex-col items-center justify-center text-xs font-bold text-white shadow-sm ring-6 ${ringColor} z-10 transition-all duration-300`}
                >
                    <span className="text-[10px] leading-none">{capacidad}</span>
                    <span className="mt-0.5 text-[7px] font-medium uppercase opacity-80">Pers.</span>
                </div>
            </div>
        );
    };

    // Filter computation
    const filteredMesas = useMemo(() => {
        const q = query.trim().toLowerCase();
        return listaMesas.filter((mesa) => {
            // 1. Search Query
            if (q && !mesa.nombre.toLowerCase().includes(q)) {
                return false;
            }
            // 2. Restaurant Filter
            if (filtroRestaurante !== 'todos' && mesa.restaurante_id.toString() !== filtroRestaurante) {
                return false;
            }
            // 3. Status Filter
            if (filtroEstado === 'disponibles' && (mesa.estado !== 'disponible' || !mesa.activa)) return false;
            if (filtroEstado === 'ocupadas' && mesa.estado !== 'ocupada') return false;
            if (filtroEstado === 'inactivas' && mesa.activa) return false;

            return true;
        });
    }, [listaMesas, query, filtroEstado, filtroRestaurante]);

    // Statistics aggregates
    const stats = useMemo(() => {
        const total = listaMesas.length;
        const libres = listaMesas.filter((m) => m.estado === 'disponible' && m.activa).length;
        const ocupadas = listaMesas.filter((m) => m.estado === 'ocupada' && m.activa).length;
        const inactivas = listaMesas.filter((m) => !m.activa).length;
        return { total, libres, ocupadas, inactivas };
    }, [listaMesas]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Mesas" />
            <ConfiguracionLayout>
                {/* CABECERA */}
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                            Gestión de Mesas <Table className="h-6 w-6 text-indigo-500" />
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Administra los locales, la distribución de mesas, capacidades y tokens QR de autoservicio.
                        </p>
                    </div>
                    <Button
                        onClick={abrirCrear}
                        className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 dark:shadow-none"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Mesa
                    </Button>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
                    <Card className="border-indigo-100 bg-indigo-50/10 dark:border-indigo-950/40 dark:bg-indigo-950/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex items-center justify-center rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900">
                                <Table className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-indigo-550 text-xs font-semibold tracking-wider uppercase dark:text-indigo-400">Total Mesas</p>
                                <p className="text-slate-850 text-xl font-black dark:text-slate-100">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-150 bg-emerald-50/10 dark:border-emerald-950/40 dark:bg-emerald-950/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex items-center justify-center rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                    Disponibles / Libres
                                </p>
                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.libres}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-150 bg-amber-50/10 dark:border-amber-950/40 dark:bg-amber-950/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex items-center justify-center rounded-xl bg-amber-100 p-2 dark:bg-amber-900">
                                <Wifi className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-amber-650 text-xs font-semibold tracking-wider uppercase dark:text-amber-400">Mesas Ocupadas</p>
                                <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.ocupadas}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-900/10">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex items-center justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                                <AlertCircle className="text-slate-550 h-5 w-5 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Mesas Inactivas</p>
                                <p className="text-slate-650 dark:text-slate-350 text-xl font-black">{stats.inactivas}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* FILTROS Y CONTROLES */}
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 py-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <Search className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input
                                placeholder="Buscar mesa por nombre (ej: Terraza 4)..."
                                value={query}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 bg-white pl-11 shadow-xs focus-visible:ring-indigo-500 dark:bg-slate-950"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="hover:text-slate-650 absolute top-3.5 right-3.5 text-slate-400">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filtros rápidos por estado */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-0.5 rounded-xl bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
                                <button
                                    onClick={() => setFiltroEstado('todos')}
                                    className={`rounded-lg px-3 py-1.5 transition ${filtroEstado === 'todos' ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400' : 'hover:text-slate-850 text-slate-500 dark:hover:text-slate-200'}`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setFiltroEstado('disponibles')}
                                    className={`rounded-lg px-3 py-1.5 transition ${filtroEstado === 'disponibles' ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400' : 'hover:text-slate-850 text-slate-500 dark:hover:text-slate-200'}`}
                                >
                                    Disponibles
                                </button>
                                <button
                                    onClick={() => setFiltroEstado('ocupadas')}
                                    className={`rounded-lg px-3 py-1.5 transition ${filtroEstado === 'ocupadas' ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400' : 'hover:text-slate-850 text-slate-500 dark:hover:text-slate-200'}`}
                                >
                                    Ocupadas
                                </button>
                                <button
                                    onClick={() => setFiltroEstado('inactivas')}
                                    className={`rounded-lg px-3 py-1.5 transition ${filtroEstado === 'inactivas' ? 'bg-white font-semibold text-indigo-600 shadow-xs dark:bg-slate-950 dark:text-indigo-400' : 'hover:text-slate-850 text-slate-500 dark:hover:text-slate-200'}`}
                                >
                                    Inactivas
                                </button>
                            </div>

                            {/* Filtro por restaurante si hay más de 1 */}
                            {restaurantes.length > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <Store className="h-4 w-4 text-slate-400" />
                                    <select
                                        value={filtroRestaurante}
                                        onChange={(e) => setFiltroRestaurante(e.target.value)}
                                        className="dark:text-slate-350 h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-slate-950"
                                    >
                                        <option value="todos">Todos los Restaurantes</option>
                                        {restaurantes.map((r) => (
                                            <option key={r.id} value={r.id.toString()}>
                                                {r.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRILLA DE MESAS */}
                <div className="mt-6">
                    {filteredMesas.length === 0 ? (
                        <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/20 p-12 text-center dark:border-slate-800">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                <Table className="text-slate-450 h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No se encontraron mesas</h3>
                            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                                No hay mesas registradas que coincidan con la búsqueda o filtros aplicados.
                            </p>
                            <Button onClick={abrirCrear} variant="outline" className="mt-4 rounded-xl border-slate-200 hover:bg-slate-50">
                                Registrar una mesa
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {filteredMesas.map((mesa) => {
                                const isOcupada = mesa.estado === 'ocupada';
                                const isInactive = !mesa.activa;
                                return (
                                    <article
                                        key={mesa.id}
                                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-300 hover:shadow-md dark:bg-slate-950 ${
                                            isInactive
                                                ? 'border-slate-200 bg-slate-50/30 opacity-70'
                                                : isOcupada
                                                  ? 'border-amber-200 shadow-amber-50/20 dark:border-amber-900/60'
                                                  : 'border-emerald-200 shadow-emerald-50/20 dark:border-emerald-900/60'
                                        }`}
                                    >
                                        {/* Barra superior indicadora de estado */}
                                        <div
                                            className={`h-1.5 w-full ${isInactive ? 'bg-slate-400' : isOcupada ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        />

                                        {/* Cuerpo de la Tarjeta */}
                                        <div className="flex flex-1 flex-col justify-between p-4">
                                            {/* Nombre y Badge de Capacidad */}
                                            <div className="mb-2 flex items-start justify-between gap-1.5">
                                                <div>
                                                    <h3 className="text-base font-extrabold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-50">
                                                        {mesa.nombre}
                                                    </h3>
                                                    {/* Mostrar restaurante si aplica */}
                                                    {restaurantes.length > 1 && (
                                                        <span className="text-slate-450 block text-[10px] font-medium dark:text-slate-500">
                                                            📍 {restaurantes.find((r) => r.id === mesa.restaurante_id)?.nombre || 'Restaurante'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <Badge
                                                        variant={isOcupada ? 'default' : 'secondary'}
                                                        className={`rounded-lg text-[10px] font-bold ${
                                                            isInactive
                                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                                : isOcupada
                                                                  ? 'dark:text-amber-350 border border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-none dark:bg-amber-950/40'
                                                                  : 'dark:text-emerald-350 border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-none dark:bg-emerald-950/40'
                                                        }`}
                                                    >
                                                        {isInactive ? 'Inhabilitada' : isOcupada ? 'Ocupada' : 'Libre'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Representación gráfica interactiva de la mesa */}
                                            {renderVisualTable(mesa.capacidad, mesa.estado, mesa.activa)}

                                            {/* Token & Info */}
                                            <div className="space-y-2 border-t border-slate-100 pt-2 dark:border-slate-800">
                                                {/* Estado Habilitada Toggle */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-450 text-[10px] font-bold tracking-wider uppercase">Habilitada:</span>
                                                    <button
                                                        onClick={() => toggleActiva(mesa)}
                                                        disabled={loadingActiva[mesa.id]}
                                                        className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold transition ${
                                                            mesa.activa
                                                                ? 'border-indigo-150 dark:text-indigo-350 border bg-indigo-50/50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/20'
                                                                : 'border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {loadingActiva[mesa.id] ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                                                        ) : (
                                                            <span>{mesa.activa ? 'Activa' : 'Inactiva'}</span>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Cambiar Estado Libre/Ocupado */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-450 text-[10px] font-bold tracking-wider uppercase">
                                                        Disponibilidad:
                                                    </span>
                                                    <button
                                                        onClick={() => toggleEstado(mesa)}
                                                        disabled={loadingEstado[mesa.id] || isInactive}
                                                        className={`flex items-center justify-between gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition ${
                                                            isInactive
                                                                ? 'border-slate-150 cursor-not-allowed bg-slate-50 text-slate-400'
                                                                : isOcupada
                                                                  ? 'dark:text-amber-350 cursor-pointer border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20'
                                                                  : 'border-emerald-250 cursor-pointer bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        {loadingEstado[mesa.id] ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                                                        ) : (
                                                            <span>{isOcupada ? 'Ocupada' : 'Libre'}</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ACCIONES FOOTER */}
                                        <div className="border-slate-150 flex border-t bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/20">
                                            {/* Ver QR */}
                                            <button
                                                onClick={() => setQrMesa(mesa)}
                                                className="text-slate-655 dark:text-slate-350 border-slate-150 dark:border-slate-850 flex flex-1 items-center justify-center gap-1.5 border-r py-2.5 text-xs font-semibold transition hover:bg-indigo-50/40 hover:text-indigo-600 dark:hover:bg-slate-900 dark:hover:text-indigo-400"
                                                title="Administrar código QR"
                                            >
                                                <QrCode className="h-3.5 w-3.5" />
                                                Código QR
                                            </button>

                                            {/* Editar */}
                                            <button
                                                onClick={() => abrirEditar(mesa)}
                                                className="text-slate-655 dark:text-slate-350 border-slate-150 dark:border-slate-850 flex flex-1 items-center justify-center gap-1.5 border-r py-2.5 text-xs font-semibold transition hover:bg-amber-50/40 hover:text-amber-600 dark:hover:bg-slate-900 dark:hover:text-amber-400"
                                                title="Editar mesa"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Editar
                                            </button>

                                            {/* Eliminar */}
                                            <button
                                                onClick={() => setDeletingMesaId(mesa.id)}
                                                className="hover:text-red-650 flex items-center justify-center px-4 text-slate-400 transition hover:bg-red-50/40 dark:hover:bg-red-950/20"
                                                title="Eliminar mesa"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PAGINACIÓN */}
                {mesas.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {Array.from({ length: mesas.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === mesas.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(route('mesas.index'), { page })}
                                className="h-8.5 w-8.5 rounded-lg p-0 text-xs"
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}

                {/* DRAWER LATERAL: CREACIÓN Y EDICIÓN DE MESA */}
                <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <SheetContent
                        side="right"
                        className="w-full overflow-y-auto rounded-l-2xl border-l p-6 sm:max-w-md md:max-w-lg dark:bg-slate-950"
                    >
                        <SheetHeader className="mb-4 border-b pb-4">
                            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50">
                                {editingMesa ? <Edit className="h-5 w-5 text-indigo-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
                                {editingMesa ? 'Editar Mesa' : 'Crear Nueva Mesa'}
                            </SheetTitle>
                            <SheetDescription className="text-sm text-slate-500">
                                {editingMesa
                                    ? 'Modifica las características y el local de esta mesa. La sincronización se aplicará de inmediato.'
                                    : 'Añade una mesa al restaurante. Se le asignará un token único y se generará su código QR automáticamente.'}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-2">
                            <FormularioMesa
                                restaurantes={restaurantes}
                                mesa={editingMesa}
                                onSuccess={handleFormSuccess}
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* DIÁLOGO MODAL: MOSTRAR QR DE LA MESA */}
                <Dialog open={qrMesa !== null} onOpenChange={(open) => !open && setQrMesa(null)}>
                    <DialogContent className="rounded-2xl p-6 sm:max-w-md dark:bg-slate-950">
                        <DialogHeader className="mb-4 border-b pb-3">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
                                <QrCode className="h-5 w-5 text-indigo-500" />
                                Código QR del Menú
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Este QR está vinculado directamente a <strong className="text-slate-800 dark:text-slate-200">{qrMesa?.nombre}</strong>
                                .
                            </DialogDescription>
                        </DialogHeader>

                        {qrMesa && (
                            <div className="space-y-5 text-center">
                                {/* SVG Generado en el Backend */}
                                <div className="inline-block rounded-2xl border bg-slate-50 p-4 shadow-inner dark:bg-slate-900">
                                    <img
                                        src={route('mesas.generar-qr', qrMesa.id)}
                                        alt={`Código QR ${qrMesa.nombre}`}
                                        className="mx-auto h-48 w-48 rounded-xl border border-slate-100 bg-white object-contain p-2"
                                    />
                                </div>

                                {/* Token Info */}
                                <div className="mx-auto max-w-sm space-y-1.5 rounded-xl border bg-slate-50 p-3 text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Token QR Único:</span>
                                        <button
                                            onClick={() => copyToken(qrMesa.qr_token)}
                                            className="text-indigo-650 flex items-center gap-1 text-[11px] font-semibold hover:underline"
                                        >
                                            {copiedToken ? (
                                                <span className="flex items-center gap-0.5 text-emerald-600">
                                                    <Check className="h-3.5 w-3.5" /> Copiado
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-0.5">
                                                    <Copy className="h-3.5 w-3.5" /> Copiar Token
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                    <p className="dark:text-slate-350 font-mono text-[11px] leading-relaxed break-all text-slate-700 select-all">
                                        {qrMesa.qr_token}
                                    </p>
                                </div>

                                {/* Acciones del QR */}
                                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadQR(qrMesa)}
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-semibold"
                                    >
                                        <Download className="h-4 w-4" />
                                        Descargar SVG
                                    </Button>
                                    <Button
                                        onClick={() => handlePrintQR(qrMesa)}
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Imprimir QR
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 border-t pt-3">
                            <DialogClose asChild>
                                <Button className="w-full rounded-xl sm:w-auto">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DIÁLOGO MODAL: CONFIRMACIÓN DE ELIMINAR MESA */}
                <Dialog open={deletingMesaId !== null} onOpenChange={(open) => !open && setDeletingMesaId(null)}>
                    <DialogContent className="rounded-2xl p-6 sm:max-w-md dark:bg-slate-950">
                        <DialogHeader className="mb-3 border-b pb-3">
                            <DialogTitle className="dark:text-slate-550 flex items-center gap-2 text-lg font-bold text-slate-950">
                                <ShieldAlert className="h-5 w-5 animate-pulse text-rose-500" />
                                ¿Eliminar esta mesa?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">Esta acción es destructiva e irreversible.</DialogDescription>
                        </DialogHeader>

                        <div className="text-slate-705 dark:text-slate-350 py-2 text-sm">
                            ¿Estás seguro de que deseas eliminar permanentemente esta mesa? Los códigos QR vinculados a esta mesa dejarán de funcionar
                            de inmediato para los clientes.
                        </div>

                        <DialogFooter className="mt-4 flex items-center justify-end gap-2.5 border-t pt-3">
                            <Button variant="outline" onClick={() => setDeletingMesaId(null)} disabled={eliminandoId !== null} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminarMesa}
                                disabled={eliminandoId !== null}
                                className="bg-red-650 hover:bg-red-750 rounded-xl text-white shadow-xs"
                            >
                                {eliminandoId !== null ? (
                                    <span className="flex items-center gap-1.5">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </span>
                                ) : (
                                    'Eliminar permanentemente'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
