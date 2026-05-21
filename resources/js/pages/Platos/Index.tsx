import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Categoria, type Opcion, type Plato } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useMemo } from 'react';
import { 
    DollarSign, Search, Plus, Edit, Trash2, CheckCircle2, 
    XCircle, UtensilsCrossed, Sparkles, AlertCircle, 
    RefreshCw, Flame, Coffee, HelpCircle, Layers, X, PlusCircle, Check
} from 'lucide-react';
import Formulario from './Formulario';

const PRODUCTION_AREA_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    none: { label: 'Entrega Directa', icon: '📦', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    kitchen: { label: 'Cocina', icon: '🍳', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-100/30' },
    bar: { label: 'Bar', icon: '🍹', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-100/30' },
};

export default function Index({ categorias, platos }: { categorias: Categoria[]; platos: { data: Plato[] } | Plato[] }) {
    const platosArray: Plato[] = Array.isArray(platos) ? platos : (platos as { data: Plato[] }).data;
    
    // Core state
    const [listaPlatos, setListaPlatos] = React.useState<Plato[]>(platosArray);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<Categoria[]>([]);
    const [query, setQuery] = useState('');
    
    // Interactive filtering states
    const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');
    const [filtroDisponible, setFiltroDisponible] = useState<'todos' | 'disponibles' | 'agotados'>('todos');

    // Create & Edit State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlato, setEditingPlato] = useState<Plato | null>(null);

    // Opciones (Variants) Modal State
    const [opcionesPlato, setOpcionesPlato] = useState<Plato | null>(null);
    const [nuevaOpcion, setNuevaOpcion] = useState({ nombre: '', precio_extra: 0 });
    const [opcionError, setOpcionError] = useState<string | null>(null);
    const [agregandoOpcion, setAgregandoOpcion] = useState(false);

    // Delete Confirmation State
    const [deletingPlatoId, setDeletingPlatoId] = useState<number | null>(null);
    const [eliminandoId, setEliminandoId] = useState<number | null>(null);

    // Individual Action Loading states
    const [loadingActivo, setLoadingActivo] = useState<Record<number, boolean>>({});
    const [loadingDisponible, setLoadingDisponible] = useState<Record<number, boolean>>({});

    // Filter categories logic
    const handleClickCategoria = (categoria: Categoria) => {
        setCategoriaSeleccionada((prev) => {
            const existe = prev.some((cat) => cat.id === categoria.id);
            if (existe) {
                return prev.filter((cat) => cat.id !== categoria.id);
            } else {
                return [...prev, categoria];
            }
        });
    };

    const clearCategoryFilters = () => setCategoriaSeleccionada([]);

    // AJAX: Toggle Active
    const toggleActivo = async (id: number) => {
        setLoadingActivo(prev => ({ ...prev, [id]: true }));
        try {
            const response = await axios.post(route('platos.toggle-activo', id));
            setListaPlatos((prev) => prev.map((p) => (p.id === id ? { ...p, activo: response.data.plato.activo } : p)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingActivo(prev => ({ ...prev, [id]: false }));
        }
    };

    // AJAX: Toggle Available
    const toggleDisponible = async (id: number) => {
        setLoadingDisponible(prev => ({ ...prev, [id]: true }));
        try {
            const response = await axios.post(route('platos.toggle-disponible', id));
            setListaPlatos((prev) => prev.map((p) => (p.id === id ? { ...p, disponible: response.data.plato.disponible } : p)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDisponible(prev => ({ ...prev, [id]: false }));
        }
    };

    // AJAX: Manage options
    const abrirModalOpciones = (plato: Plato) => {
        setOpcionesPlato(plato);
        setNuevaOpcion({ nombre: '', precio_extra: 0 });
        setOpcionError(null);
    };

    const agregarOpcion = async () => {
        if (!opcionesPlato) return;
        if (!nuevaOpcion.nombre.trim()) {
            setOpcionError('El nombre de la variante es obligatorio.');
            return;
        }
        setOpcionError(null);
        setAgregandoOpcion(true);
        try {
            const response = await axios.post(route('platos.opciones.store', opcionesPlato.id), nuevaOpcion);
            const opcionCreada = response.data.opcion;
            
            // Update local state
            setListaPlatos((prev) =>
                prev.map((p) =>
                    p.id === opcionesPlato.id ? { ...p, opciones: [...(p.opciones || []), opcionCreada] } : p,
                ),
            );
            
            // Update modal state
            setOpcionesPlato((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    opciones: [...(prev.opciones || []), opcionCreada],
                };
            });
            
            setNuevaOpcion({ nombre: '', precio_extra: 0 });
        } catch (error: unknown) {
            let msg = 'Error al agregar opción.';
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data as any;
                if (responseData?.errors) {
                    msg = Object.values(responseData.errors as Record<string, string[]>).flat().join(' ');
                } else if (responseData?.message) {
                    msg = responseData.message;
                }
            }
            setOpcionError(msg);
        } finally {
            setAgregandoOpcion(false);
        }
    };

    const eliminarOpcion = async (opcionId: number) => {
        if (!opcionesPlato) return;
        try {
            await axios.delete(route('platos.opciones.destroy', { plato: opcionesPlato.id, opcion: opcionId }));
            
            // Update local state
            setListaPlatos((prev) =>
                prev.map((p) =>
                    p.id === opcionesPlato.id ? { ...p, opciones: (p.opciones || []).filter((o: Opcion) => o.id !== opcionId) } : p,
                ),
            );

            // Update modal state
            setOpcionesPlato((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    opciones: (prev.opciones || []).filter((o: Opcion) => o.id !== opcionId),
                };
            });
        } catch (error) {
            console.error(error);
        }
    };

    // AJAX: Delete Plato
    const confirmarEliminarPlato = async () => {
        if (!deletingPlatoId) return;
        setEliminandoId(deletingPlatoId);
        try {
            await axios.delete(route('platos.destroy', deletingPlatoId));
            setListaPlatos((prev) => prev.filter((p) => p.id !== deletingPlatoId));
            setDeletingPlatoId(null);
        } catch (error) {
            console.error(error);
        } finally {
            setEliminandoId(null);
        }
    };

    // Create & Edit triggers
    const abrirCrear = () => {
        setEditingPlato(null);
        setIsFormOpen(true);
    };

    const abrirEditar = (plato: Plato) => {
        setEditingPlato(plato);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingPlato(null);
        // Reload Inertia props to sync DB changes
        router.reload({ 
            only: ['platos'],
            onSuccess: (page) => {
                const updatedPlatos = page.props.platos as any;
                const newArray = Array.isArray(updatedPlatos) ? updatedPlatos : updatedPlatos.data;
                if (newArray) setListaPlatos(newArray);
            }
        });
    };

    // Filter & Search computation
    const displayedPlatos = useMemo(() => {
        const q = query.trim().toLowerCase();
        return listaPlatos
            .filter((p) => {
                // 1. Search Query
                if (q && !p.nombre.toLowerCase().includes(q) && !(p.descripcion || '').toLowerCase().includes(q)) {
                    return false;
                }
                // 2. Categories
                if (categoriaSeleccionada.length > 0 && !categoriaSeleccionada.some((cat) => cat.id === p.categoria_id)) {
                    return false;
                }
                // 3. Status
                if (filtroActivo === 'activos' && !p.activo) return false;
                if (filtroActivo === 'inactivos' && p.activo) return false;
                
                // 4. Availability
                if (filtroDisponible === 'disponibles' && !p.disponible) return false;
                if (filtroDisponible === 'agotados' && p.disponible) return false;

                return true;
            })
            .sort((a, b) => Number(b.activo) - Number(a.activo));
    }, [listaPlatos, query, categoriaSeleccionada, filtroActivo, filtroDisponible]);

    return (
        <AppLayout>
            <Head title="Platos y Productos" />
            <ConfiguracionLayout>
                
                {/* CABECERA DE LA SECCIÓN */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            Platos y Catálogo <Sparkles className="h-6 w-6 text-indigo-500" />
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Diseña tu menú, gestiona precios, áreas de cocina y las variantes de cada plato.
                        </p>
                    </div>
                    <Button 
                        onClick={abrirCrear} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-2 font-semibold transition"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Plato
                    </Button>
                </div>

                {/* FILTROS Y CONTROLES */}
                <div className="space-y-4 py-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre, descripción o ingredientes..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-11 h-11 bg-white dark:bg-slate-950 border-slate-200/80 rounded-xl focus-visible:ring-indigo-500 shadow-xs"
                            />
                            {query && (
                                <button 
                                    onClick={() => setQuery('')}
                                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filtros Rápidos de Estado */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex gap-0.5 text-xs font-medium">
                                <button 
                                    onClick={() => setFiltroActivo('todos')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroActivo === 'todos' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Todos
                                </button>
                                <button 
                                    onClick={() => setFiltroActivo('activos')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroActivo === 'activos' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Activos
                                </button>
                                <button 
                                    onClick={() => setFiltroActivo('inactivos')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroActivo === 'inactivos' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Inactivos
                                </button>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex gap-0.5 text-xs font-medium">
                                <button 
                                    onClick={() => setFiltroDisponible('todos')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroDisponible === 'todos' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Disponibilidad
                                </button>
                                <button 
                                    onClick={() => setFiltroDisponible('disponibles')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroDisponible === 'disponibles' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Disponible
                                </button>
                                <button 
                                    onClick={() => setFiltroDisponible('agotados')} 
                                    className={`px-3 py-1.5 rounded-lg transition ${filtroDisponible === 'agotados' ? 'bg-white dark:bg-slate-950 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Agotado
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filtro de Categorías Pills */}
                    {categorias && categorias.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Layers className="h-3 w-3" /> Filtrar por categoría:
                            </p>
                            <div className="flex flex-wrap gap-1.5 items-center">
                                <button
                                    onClick={clearCategoryFilters}
                                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                                        categoriaSeleccionada.length === 0
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    Todas las categorías
                                </button>
                                {categorias.map((categoria) => {
                                    const activo = categoriaSeleccionada.some((cat) => cat.id === categoria.id);
                                    return (
                                        <button
                                            key={categoria.id}
                                            onClick={() => handleClickCategoria(categoria)}
                                            className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                                                activo
                                                    ? 'bg-indigo-600 border-indigo-600 text-white font-medium shadow-xs shadow-indigo-100'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                                            }`}
                                        >
                                            {activo && <Check className="h-3 w-3" />}
                                            {categoria.nombre}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* GRILLA DE PLATOS */}
                <div className="mt-6">
                    {displayedPlatos.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center max-w-xl mx-auto mt-8 bg-slate-50/20">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <UtensilsCrossed className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No se encontraron platos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                Intenta cambiar tus términos de búsqueda o filtros, o agrega un nuevo producto al catálogo.
                            </p>
                            <Button 
                                onClick={abrirCrear} 
                                variant="outline" 
                                className="mt-4 rounded-xl border-slate-200 hover:bg-slate-50"
                            >
                                Crear un plato
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {displayedPlatos.map((plato) => {
                                const prodArea = PRODUCTION_AREA_LABELS[plato.production_area || 'none'];
                                return (
                                    <article 
                                        key={plato.id} 
                                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white dark:bg-slate-950 shadow-xs hover:shadow-md transition-all duration-300 ${!plato.activo ? 'opacity-75 border-slate-200 bg-slate-50/30' : 'border-slate-100 dark:border-slate-800'}`}
                                    >
                                        
                                        {/* ZONA DE IMAGEN Y PRECIO */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b">
                                            {plato.imagen ? (
                                                <img 
                                                    src={plato.imagen} 
                                                    alt={plato.nombre} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        // Fallback image handling
                                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                                                    <UtensilsCrossed className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">Sin imagen</span>
                                                </div>
                                            )}

                                            {/* Tag de Categoría */}
                                            {plato.categoria && (
                                                <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white tracking-wide">
                                                    {plato.categoria.nombre}
                                                </span>
                                            )}

                                            {/* Tag de Precio */}
                                            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-0.5 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                                                ${(Number(plato.precio) || 0).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* CONTENIDO E INFORMACIÓN */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                        {plato.nombre}
                                                    </h3>
                                                </div>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-3">
                                                    {plato.descripcion || 'Sin descripción adicional para este plato.'}
                                                </p>
                                            </div>

                                            <div className="space-y-2.5">
                                                {/* Meta Info: Área de preparación */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                                        Preparación:
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border ${prodArea.color}`}>
                                                        <span>{prodArea.icon}</span>
                                                        <span>{prodArea.label}</span>
                                                    </span>
                                                </div>

                                                {/* Toggles interactivos rápidos */}
                                                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                                    
                                                    {/* Toggle Activo */}
                                                    <button 
                                                        onClick={() => toggleActivo(plato.id)}
                                                        disabled={loadingActivo[plato.id]}
                                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer select-none ${
                                                            plato.activo 
                                                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-300' 
                                                                : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <span className={`h-1.5 w-1.5 rounded-full ${plato.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                            {plato.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                        {loadingActivo[plato.id] ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                                                        ) : (
                                                            <span className="text-[9px] opacity-60">Alterar</span>
                                                        )}
                                                    </button>

                                                    {/* Toggle Disponible */}
                                                    <button 
                                                        onClick={() => toggleDisponible(plato.id)}
                                                        disabled={loadingDisponible[plato.id]}
                                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer select-none ${
                                                            plato.disponible 
                                                                ? 'bg-indigo-50/50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-300' 
                                                                : 'bg-rose-50/60 border-rose-150 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <span className={`h-1.5 w-1.5 rounded-full ${plato.disponible ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                                                            {plato.disponible ? 'Disponible' : 'Agotado'}
                                                        </span>
                                                        {loadingDisponible[plato.id] ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                                                        ) : (
                                                            <span className="text-[9px] opacity-60">Alterar</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ACCIONES FOOTER */}
                                        <div className="flex border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                                            {/* Opciones */}
                                            <button 
                                                onClick={() => abrirModalOpciones(plato)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-indigo-50/40 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 border-r border-slate-150 dark:border-slate-850 transition"
                                            >
                                                <Layers className="h-3.5 w-3.5" />
                                                Opciones ({(plato.opciones || []).length})
                                            </button>

                                            {/* Editar */}
                                            <button 
                                                onClick={() => abrirEditar(plato)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-amber-50/40 dark:hover:bg-slate-900 hover:text-amber-600 dark:hover:text-amber-400 border-r border-slate-150 dark:border-slate-850 transition"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                Editar
                                            </button>

                                            {/* Eliminar */}
                                            <button 
                                                onClick={() => setDeletingPlatoId(plato.id)}
                                                className="px-4 flex items-center justify-center text-slate-400 hover:text-red-650 hover:bg-red-50/40 dark:hover:bg-red-950/20 transition"
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

                {/* DRAWER / SLIDE-OVER PARA FORMULARIO (CREAR Y EDITAR) */}
                <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto rounded-l-2xl border-l p-6 dark:bg-slate-950">
                        <SheetHeader className="pb-4 mb-4 border-b">
                            <SheetTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                {editingPlato ? <Edit className="h-5 w-5 text-indigo-500" /> : <Plus className="h-5 w-5 text-indigo-500" />}
                                {editingPlato ? 'Editar Plato del Catálogo' : 'Crear Nuevo Plato'}
                            </SheetTitle>
                            <SheetDescription className="text-sm text-slate-500">
                                {editingPlato 
                                    ? 'Modifica las propiedades de este producto. Los cambios se reflejarán inmediatamente en tu menú digital.' 
                                    : 'Añade un nuevo plato al menú. Rellena los datos básicos, el precio y selecciona su área de preparación.'}
                            </SheetDescription>
                        </SheetHeader>
                        
                        <div className="py-2">
                            <Formulario 
                                categorias={categorias} 
                                plato={editingPlato} 
                                onSuccess={handleFormSuccess} 
                                onCancel={() => setIsFormOpen(false)}
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* DIÁLOGO MODAL: GESTIÓN DE OPCIONES (VARIANTES) */}
                <Dialog open={opcionesPlato !== null} onOpenChange={(open) => !open && setOpcionesPlato(null)}>
                    <DialogContent className="sm:max-w-lg rounded-2xl p-6 dark:bg-slate-950">
                        <DialogHeader className="pb-3 border-b mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-indigo-500" />
                                Opciones y Variantes
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs">
                                Gestiona las alternativas o agregados para <strong className="text-slate-800 dark:text-slate-200">{opcionesPlato?.nombre}</strong>. (Ej: extra queso, sin cebolla, término de cocción).
                            </DialogDescription>
                        </DialogHeader>

                        {/* Formulario rápido para agregar opción */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Añadir nueva opción / extra</h4>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Nombre (ej: Doble Carne, Con Queso)"
                                        value={nuevaOpcion.nombre}
                                        onChange={(e) => setNuevaOpcion((prev) => ({ ...prev, nombre: e.target.value }))}
                                        className="h-9 bg-white dark:bg-slate-950 border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="w-full sm:w-28 relative">
                                    <DollarSign className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Precio Extra"
                                        value={nuevaOpcion.precio_extra || ''}
                                        min={0}
                                        onChange={(e) => setNuevaOpcion((prev) => ({ ...prev, precio_extra: parseFloat(e.target.value) || 0 }))}
                                        className="pl-8 h-9 bg-white dark:bg-slate-950 border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <Button 
                                    onClick={agregarOpcion} 
                                    disabled={agregandoOpcion}
                                    size="sm" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 font-medium px-4 shadow-sm"
                                >
                                    {agregandoOpcion ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <PlusCircle className="h-4 w-4" /> Agregar
                                        </span>
                                    )}
                                </Button>
                            </div>
                            {opcionError && <p className="text-[11px] font-medium text-rose-500 mt-1">{opcionError}</p>}
                        </div>

                        {/* Listado de Opciones Existentes */}
                        <div className="mt-4 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opciones actuales:</h4>
                            
                            {!opcionesPlato?.opciones || opcionesPlato.opciones.length === 0 ? (
                                <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50/10">
                                    <Layers className="h-7 w-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        No hay opciones ni variantes registradas para este plato.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl max-h-56 overflow-y-auto">
                                    {opcionesPlato.opciones.map((opcion: Opcion) => (
                                        <li key={opcion.id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{opcion.nombre}</span>
                                                {opcion.precio_extra > 0 && (
                                                    <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 px-2 py-0.5 rounded-md font-bold">
                                                        +${(Number(opcion.precio_extra) || 0).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/20 flex items-center justify-center transition"
                                                onClick={() => eliminarOpcion(opcion.id)}
                                                title="Eliminar opción"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <DialogFooter className="mt-6 border-t pt-4">
                            <DialogClose asChild>
                                <Button className="w-full sm:w-auto rounded-xl">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DIÁLOGO MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE PLATO */}
                <Dialog open={deletingPlatoId !== null} onOpenChange={(open) => !open && setDeletingPlatoId(null)}>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6 dark:bg-slate-950">
                        <DialogHeader className="pb-3 border-b mb-3">
                            <DialogTitle className="text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-rose-500 animate-pulse" />
                                ¿Eliminar este plato?
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs">
                                Esta acción es permanente. Se eliminará el plato y todas sus variantes de la base de datos de manera definitiva.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2 text-sm text-slate-700 dark:text-slate-350">
                            ¿Estás seguro de que deseas eliminar este plato? Los clientes no podrán ordenarlo y se quitará de todos los menús activos.
                        </div>

                        <DialogFooter className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingPlatoId(null)}
                                disabled={eliminandoId !== null}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminarPlato}
                                disabled={eliminandoId !== null}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm shadow-red-100 dark:shadow-none"
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
