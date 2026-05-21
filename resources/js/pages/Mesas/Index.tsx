import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { BreadcrumbItem, type Mesa } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Table, Users, CheckCircle2, Edit, Plus, QrCode, Trash2, 
    Wifi, Search, RefreshCw, X, AlertCircle, Copy, Printer, 
    Download, Check, Store, ShieldAlert
} from 'lucide-react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mesas', href: '/configuracion/mesas' },
];

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
        setLoadingEstado(prev => ({ ...prev, [mesa.id]: true }));
        try {
                await router.patch(
                    route('mesas.cambiar-estado', mesa.id),
                    {},
                    {
                        onSuccess: () => {
                            // The list updates automatically from props sync
                        },
                        onFinish: () => {
                            setLoadingEstado(prev => ({ ...prev, [mesa.id]: false }));
                        }
                    }
                );
        } catch (error) {
            console.error(error);
            setLoadingEstado(prev => ({ ...prev, [mesa.id]: false }));
        }
    };

    // Fast Toggle: Active Status (Activa/Inactiva)
    const toggleActiva = async (mesa: Mesa) => {
        setLoadingActiva(prev => ({ ...prev, [mesa.id]: true }));
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
                    setLoadingActiva(prev => ({ ...prev, [mesa.id]: false }));
                }
            });
        } catch (error) {
            console.error(error);
            setLoadingActiva(prev => ({ ...prev, [mesa.id]: false }));
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
                }
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
                    className={`absolute w-3 h-3 rounded-full ${chairBg} border border-white dark:border-slate-950 transition-all duration-300`} 
                />
            );
        }

        return (
            <div className="relative w-20 h-20 flex items-center justify-center mx-auto my-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    {chairElements}
                </div>
                <div className={`w-12 h-12 rounded-full ${tableBg} text-white flex flex-col items-center justify-center font-bold text-xs shadow-sm ring-6 ${ringColor} transition-all duration-300 z-10`}>
                    <span className="text-[10px] leading-none">{capacidad}</span>
                    <span className="text-[7px] font-medium opacity-80 uppercase mt-0.5">Pers.</span>
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
        const libres = listaMesas.filter(m => m.estado === 'disponible' && m.activa).length;
        const ocupadas = listaMesas.filter(m => m.estado === 'ocupada' && m.activa).length;
        const inactivas = listaMesas.filter(m => !m.activa).length;
        return { total, libres, ocupadas, inactivas };
    }, [listaMesas]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Mesas" />
            <ConfiguracionLayout>
                
                {/* CABECERA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            Gestión de Mesas <Table className="h-6 w-6 text-indigo-500" />
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Administra los locales, la distribución de mesas, capacidades y tokens QR de autoservicio.
                        </p>
                    </div>
                    <Button 
                        onClick={abrirCrear} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-2 font-semibold transition"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Mesa
                    </Button>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 py-6">
                    <Card className="border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-100 dark:bg-indigo-900 p-2 flex items-center justify-center">
                                <Table className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-indigo-550 dark:text-indigo-400 uppercase tracking-wider">Total Mesas</p>
                                <p className="text-xl font-black text-slate-850 dark:text-slate-100">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-150 dark:border-emerald-950/40 bg-emerald-50/10 dark:bg-emerald-950/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900 p-2 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Disponibles / Libres</p>
                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.libres}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-150 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 dark:bg-amber-900 p-2 flex items-center justify-center">
                                <Wifi className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-amber-650 dark:text-amber-400 uppercase tracking-wider">Mesas Ocupadas</p>
                                <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.ocupadas}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-slate-550 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mesas Inactivas</p>
                                <p className="text-xl font-black text-slate-650 dark:text-slate-350">{stats.inactivas}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* FILTROS Y CONTROLES */}
                <div className="space-y-4 py-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                            <Input
                                placeholder="Buscar mesa por nombre (ej: Terraza 4)..."
                                value={query}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                                className="pl-11 h-11 bg-white dark:bg-slate-950 border-slate-200 rounded-xl focus-visible:ring-indigo-500 shadow-xs"
                            />
                            {query && (
                                <button 
                                    onClick={() => setQuery('')}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filtros rápidos por estado */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex gap-0.5 text-xs font-medium">
                                <button 
                                    onClick={() => setFiltroEstado('todos')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroEstado === 'todos' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'}`}
                                >
                                    Todas
                                </button>
                                <button 
                                    onClick={() => setFiltroEstado('disponibles')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroEstado === 'disponibles' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'}`}
                                >
                                    Disponibles
                                </button>
                                <button 
                                    onClick={() => setFiltroEstado('ocupadas')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroEstado === 'ocupadas' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'}`}
                                >
                                    Ocupadas
                                </button>
                                <button 
                                    onClick={() => setFiltroEstado('inactivas')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroEstado === 'inactivas' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'}`}
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
                                        className="h-8.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 text-xs px-2.5 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="todos">Todos los Restaurantes</option>
                                        {restaurantes.map((r) => (
                                            <option key={r.id} value={r.id.toString()}>{r.nombre}</option>
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
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto mt-8 bg-slate-50/20">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <Table className="h-6 w-6 text-slate-450" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No se encontraron mesas</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                No hay mesas registradas que coincidan con la búsqueda o filtros aplicados.
                            </p>
                            <Button 
                                onClick={abrirCrear} 
                                variant="outline" 
                                className="mt-4 rounded-xl border-slate-200 hover:bg-slate-50"
                            >
                                Registrar una mesa
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {filteredMesas.map((mesa) => {
                                const isOcupada = mesa.estado === 'ocupada';
                                const isInactive = !mesa.activa;
                                return (
                                    <article 
                                        key={mesa.id}
                                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all duration-300 ${
                                            isInactive 
                                                ? 'opacity-70 border-slate-200 bg-slate-50/30' 
                                                : isOcupada
                                                ? 'border-amber-200 dark:border-amber-900/60 shadow-amber-50/20'
                                                : 'border-emerald-200 dark:border-emerald-900/60 shadow-emerald-50/20'
                                        }`}
                                    >
                                        {/* Barra superior indicadora de estado */}
                                        <div className={`h-1.5 w-full ${isInactive ? 'bg-slate-400' : isOcupada ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                                        {/* Cuerpo de la Tarjeta */}
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            
                                            {/* Nombre y Badge de Capacidad */}
                                            <div className="flex items-start justify-between gap-1.5 mb-2">
                                                <div>
                                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 transition-colors">
                                                        {mesa.nombre}
                                                    </h3>
                                                    {/* Mostrar restaurante si aplica */}
                                                    {restaurantes.length > 1 && (
                                                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block">
                                                            📍 {restaurantes.find(r => r.id === mesa.restaurante_id)?.nombre || 'Restaurante'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <Badge 
                                                        variant={isOcupada ? 'default' : 'secondary'}
                                                        className={`text-[10px] font-bold rounded-lg ${
                                                            isInactive
                                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                                : isOcupada 
                                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-350 dark:border-none'
                                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-350 dark:border-none'
                                                        }`}
                                                    >
                                                        {isInactive ? 'Inhabilitada' : isOcupada ? 'Ocupada' : 'Libre'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Representación gráfica interactiva de la mesa */}
                                            {renderVisualTable(mesa.capacidad, mesa.estado, mesa.activa)}

                                            {/* Token & Info */}
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                                
                                                {/* Estado Habilitada Toggle */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Habilitada:</span>
                                                    <button
                                                        onClick={() => toggleActiva(mesa)}
                                                        disabled={loadingActiva[mesa.id]}
                                                        className={`flex items-center gap-1 text-[11px] font-semibold transition py-0.5 px-2 rounded-lg cursor-pointer ${
                                                            mesa.activa
                                                                ? 'bg-indigo-50/50 text-indigo-700 border border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-350 dark:border-indigo-900/60'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800'
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
                                                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Disponibilidad:</span>
                                                    <button 
                                                        onClick={() => toggleEstado(mesa)}
                                                        disabled={loadingEstado[mesa.id] || isInactive}
                                                        className={`flex items-center justify-between gap-1 py-0.5 px-2 text-[11px] font-semibold rounded-lg border transition ${
                                                            isInactive
                                                                ? 'bg-slate-50 border-slate-150 text-slate-400 cursor-not-allowed'
                                                                : isOcupada 
                                                                ? 'bg-amber-50/50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-350 cursor-pointer' 
                                                                : 'bg-emerald-50/50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-300 cursor-pointer'
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
                                        <div className="flex border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                                            {/* Ver QR */}
                                            <button 
                                                onClick={() => setQrMesa(mesa)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-655 dark:text-slate-350 hover:bg-indigo-50/40 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 border-r border-slate-150 dark:border-slate-850 transition"
                                                title="Administrar código QR"
                                            >
                                                <QrCode className="h-3.5 w-3.5" />
                                                Código QR
                                            </button>

                                            {/* Editar */}
                                            <button 
                                                onClick={() => abrirEditar(mesa)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-655 dark:text-slate-350 hover:bg-amber-50/40 dark:hover:bg-slate-900 hover:text-amber-600 dark:hover:text-amber-400 border-r border-slate-150 dark:border-slate-850 transition"
                                                title="Editar mesa"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Editar
                                            </button>

                                            {/* Eliminar */}
                                            <button 
                                                onClick={() => setDeletingMesaId(mesa.id)}
                                                className="px-4 flex items-center justify-center text-slate-400 hover:text-red-650 hover:bg-red-50/40 dark:hover:bg-red-950/20 transition"
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
                    <div className="flex items-center justify-center gap-1.5 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {Array.from({ length: mesas.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === mesas.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(route('mesas.index'), { page })}
                                className="h-8.5 w-8.5 p-0 rounded-lg text-xs"
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}

                {/* DRAWER LATERAL: CREACIÓN Y EDICIÓN DE MESA */}
                <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto rounded-l-2xl border-l p-6 dark:bg-slate-950">
                        <SheetHeader className="pb-4 mb-4 border-b">
                            <SheetTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
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
                    <DialogContent className="sm:max-w-md rounded-2xl p-6 dark:bg-slate-950">
                        <DialogHeader className="pb-3 border-b mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-indigo-500" />
                                Código QR del Menú
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Este QR está vinculado directamente a <strong className="text-slate-800 dark:text-slate-200">{qrMesa?.nombre}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        {qrMesa && (
                            <div className="space-y-5 text-center">
                                {/* SVG Generado en el Backend */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl inline-block shadow-inner">
                                    <img 
                                        src={route('mesas.generar-qr', qrMesa.id)} 
                                        alt={`Código QR ${qrMesa.nombre}`}
                                        className="w-48 h-48 mx-auto object-contain bg-white p-2 rounded-xl border border-slate-100" 
                                    />
                                </div>

                                {/* Token Info */}
                                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border space-y-1.5 text-left max-w-sm mx-auto">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Token QR Único:</span>
                                        <button 
                                            onClick={() => copyToken(qrMesa.qr_token)}
                                            className="text-[11px] font-semibold text-indigo-650 hover:underline flex items-center gap-1"
                                        >
                                            {copiedToken ? (
                                                <span className="flex items-center gap-0.5 text-emerald-600"><Check className="h-3.5 w-3.5" /> Copiado</span>
                                            ) : (
                                                <span className="flex items-center gap-0.5"><Copy className="h-3.5 w-3.5" /> Copiar Token</span>
                                            )}
                                        </button>
                                    </div>
                                    <p className="font-mono text-slate-700 dark:text-slate-350 break-all select-all leading-relaxed text-[11px]">
                                        {qrMesa.qr_token}
                                    </p>
                                </div>

                                {/* Acciones del QR */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadQR(qrMesa)}
                                        className="rounded-xl flex items-center justify-center gap-2 h-10 text-xs font-semibold"
                                    >
                                        <Download className="h-4 w-4" />
                                        Descargar SVG
                                    </Button>
                                    <Button
                                        onClick={() => handlePrintQR(qrMesa)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 h-10 text-xs font-semibold"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Imprimir QR
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <DialogFooter className="mt-4 border-t pt-3">
                            <DialogClose asChild>
                                <Button className="w-full sm:w-auto rounded-xl">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DIÁLOGO MODAL: CONFIRMACIÓN DE ELIMINAR MESA */}
                <Dialog open={deletingMesaId !== null} onOpenChange={(open) => !open && setDeletingMesaId(null)}>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6 dark:bg-slate-950">
                        <DialogHeader className="pb-3 border-b mb-3">
                            <DialogTitle className="text-lg font-bold text-slate-950 dark:text-slate-550 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                                ¿Eliminar esta mesa?
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs">
                                Esta acción es destructiva e irreversible.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2 text-sm text-slate-705 dark:text-slate-350">
                            ¿Estás seguro de que deseas eliminar permanentemente esta mesa? Los códigos QR vinculados a esta mesa dejarán de funcionar de inmediato para los clientes.
                        </div>

                        <DialogFooter className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingMesaId(null)}
                                disabled={eliminandoId !== null}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminarMesa}
                                disabled={eliminandoId !== null}
                                className="bg-red-650 hover:bg-red-750 text-white rounded-xl shadow-xs"
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
