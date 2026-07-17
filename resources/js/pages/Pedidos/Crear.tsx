import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import pedidoService, { PedidoItem } from '@/services/pedidoService';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    Coffee,
    FileText,
    MessageSquare,
    Minus,
    Pizza,
    Plus,
    Search,
    ShoppingCart,
    Soup,
    Sparkles,
    Store,
    Table,
    Trash2,
    Utensils,
    Wine,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Mesa {
    id: number;
    nombre: string;
    estado: string;
    restaurante_id: number;
    restaurante?: { id: number; nombre: string };
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Plato {
    id: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    imagen?: string;
    categoria_id: number;
    restaurante_id?: number;
    categoria?: Categoria;
}

interface CarritoItem extends PedidoItem {
    nombre: string;
    precio: number;
    subtotal: number;
}

interface CrearProps {
    mesas: Mesa[];
    platos: Plato[];
    mesa_id?: string | null;
}

export default function Crear({ mesas, platos, mesa_id }: CrearProps) {
    const [mesaSeleccionada, setMesaSeleccionada] = useState<string>(mesa_id ?? '');
    const [isMesaGridExpanded, setIsMesaGridExpanded] = useState<boolean>(!mesa_id);
    const [busquedaMesa, setBusquedaMesa] = useState<string>('');
    const [filtroMesaEstado, setFiltroMesaEstado] = useState<'todas' | 'disponibles' | 'ocupadas'>('todas');

    const [carrito, setCarrito] = useState<CarritoItem[]>([]);
    const [notas, setNotas] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

    // Obtener mesas filtradas
    const mesasFiltradas = useMemo(() => {
        return mesas.filter((m) => {
            const coincideEstado =
                filtroMesaEstado === 'todas' ||
                (filtroMesaEstado === 'disponibles' && m.estado === 'disponible') ||
                (filtroMesaEstado === 'ocupadas' && m.estado !== 'disponible');
            const coincideBusqueda =
                !busquedaMesa ||
                m.nombre.toLowerCase().includes(busquedaMesa.toLowerCase()) ||
                (m.restaurante?.nombre || '').toLowerCase().includes(busquedaMesa.toLowerCase());
            return coincideEstado && coincideBusqueda;
        });
    }, [mesas, filtroMesaEstado, busquedaMesa]);

    // Agrupar mesas por restaurante
    const mesasAgrupadasPorRestaurante = useMemo(() => {
        const map = new Map<string, Mesa[]>();
        mesasFiltradas.forEach((m) => {
            const rNombre = m.restaurante?.nombre || 'Restaurante';
            const arr = map.get(rNombre) || [];
            arr.push(m);
            map.set(rNombre, arr);
        });
        return Array.from(map.entries());
    }, [mesasFiltradas]);

    // Obtener detalles de la mesa seleccionada
    const mesaSeleccionadaDetalle = useMemo(() => {
        return mesas.find((m) => m.id.toString() === mesaSeleccionada);
    }, [mesas, mesaSeleccionada]);

    // Agrupar categorías únicas de los platos
    const categorias = useMemo(() => {
        const map = new Map<number, Categoria>();
        platos.forEach((p) => {
            if (p.categoria) map.set(p.categoria.id, p.categoria);
        });
        return Array.from(map.values());
    }, [platos]);

    // Filtrar platos por categoría, búsqueda y restaurante de la mesa seleccionada
    const platosFiltrados = useMemo(() => {
        return platos.filter((p) => {
            const coincideCategoria = categoriaActiva === 'todas' || (p.categoria && p.categoria.id.toString() === categoriaActiva);
            const coincideBusqueda =
                !busqueda ||
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
            const coincideRestaurante = !mesaSeleccionadaDetalle || !p.restaurante_id || p.restaurante_id === mesaSeleccionadaDetalle.restaurante_id;
            return coincideCategoria && coincideBusqueda && coincideRestaurante;
        });
    }, [platos, categoriaActiva, busqueda, mesaSeleccionadaDetalle]);

    // Conteo de platos disponibles por categoría para la mesa seleccionada
    const conteoPorCategoria = useMemo(() => {
        const counts: Record<string, number> = {};
        let total = 0;
        platos.forEach((p) => {
            const coincideRestaurante = !mesaSeleccionadaDetalle || !p.restaurante_id || p.restaurante_id === mesaSeleccionadaDetalle.restaurante_id;
            if (coincideRestaurante) {
                total++;
                if (p.categoria_id) {
                    counts[p.categoria_id.toString()] = (counts[p.categoria_id.toString()] || 0) + 1;
                }
            }
        });
        counts['todas'] = total;
        return counts;
    }, [platos, mesaSeleccionadaDetalle]);

    const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCantidadItems = carrito.reduce((s, i) => s + i.cantidad, 0);

    const agregarAlCarrito = (plato: Plato) => {
        setCarrito((prev) => {
            const existing = prev.find((item) => item.producto_id === plato.id);
            if (existing) {
                return prev.map((item) =>
                    item.producto_id === plato.id ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio } : item,
                );
            }
            return [
                ...prev,
                {
                    producto_id: plato.id,
                    nombre: plato.nombre,
                    precio: Number(plato.precio),
                    cantidad: 1,
                    subtotal: Number(plato.precio),
                    notas: '',
                },
            ];
        });
    };

    const actualizarCantidad = (productoId: number, delta: number) => {
        setCarrito((prev) => {
            return prev
                .map((item) => {
                    if (item.producto_id !== productoId) return item;
                    const nuevaCantidad = item.cantidad + delta;
                    if (nuevaCantidad <= 0) return null;
                    return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio };
                })
                .filter(Boolean) as CarritoItem[];
        });
    };

    const actualizarNotasItem = (productoId: number, itemNotas: string) => {
        setCarrito((prev) => prev.map((item) => (item.producto_id === productoId ? { ...item, notas: itemNotas } : item)));
    };

    const eliminarDelCarrito = (productoId: number) => {
        setCarrito((prev) => prev.filter((item) => item.producto_id !== productoId));
    };

    const cantidadEnCarrito = (productoId: number) => {
        return carrito.find((item) => item.producto_id === productoId)?.cantidad ?? 0;
    };

    const handleEnviarPedido = async () => {
        if (!mesaSeleccionada) {
            setError('Debes seleccionar una mesa.');
            return;
        }
        if (carrito.length === 0) {
            setError('Debes agregar al menos un producto.');
            return;
        }
        if (totalCarrito <= 0) {
            setError('El total del pedido debe ser mayor a cero.');
            return;
        }

        setEnviando(true);
        setError(null);

        try {
            const response = await pedidoService.crearPedidoMesero({
                mesa_id: parseInt(mesaSeleccionada),
                items: carrito.map(({ producto_id, cantidad, notas }) => ({ producto_id, cantidad, notas: notas || undefined })),
                notas: notas || undefined,
            });

            router.visit(`/pedidos/${response.pedido.id}`);
        } catch (err: unknown) {
            const anyErr = err as { response?: { data?: { error?: string; message?: string } } };
            setError(anyErr?.response?.data?.error ?? anyErr?.response?.data?.message ?? 'Error al crear el pedido.');
        } finally {
            setEnviando(false);
        }
    };

    // Obtener un icono de comida según el nombre de la categoría
    const getCategoriaIcon = (catNombre: string) => {
        const nombre = catNombre.toLowerCase();
        if (nombre.includes('bebida') || nombre.includes('tomar') || nombre.includes('jugo') || nombre.includes('licor')) {
            return <Wine className="h-4 w-4" />;
        }
        if (nombre.includes('entrada') || nombre.includes('sopa') || nombre.includes('caldo')) {
            return <Soup className="h-4 w-4" />;
        }
        if (nombre.includes('pizza') || nombre.includes('pasta') || nombre.includes('italiana')) {
            return <Pizza className="h-4 w-4" />;
        }
        if (nombre.includes('café') || nombre.includes('postre') || nombre.includes('dulce')) {
            return <Coffee className="h-4 w-4" />;
        }
        return <Utensils className="h-4 w-4" />;
    };

    // Renderizado del contenido del carrito (para PC y móvil)
    const renderCarrito = () => (
        <div className="flex h-full flex-col justify-between">
            <div>
                <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Resumen del Pedido</h2>
                    </div>
                    {totalCantidadItems > 0 && (
                        <Badge variant="default" className="bg-blue-600 px-2 py-0.5 text-xs font-semibold hover:bg-blue-600">
                            {totalCantidadItems} ítems
                        </Badge>
                    )}
                </div>

                {carrito.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingCart className="mb-4 h-16 w-16 stroke-[1.5] text-zinc-300 dark:text-zinc-700" />
                        <p className="font-medium text-zinc-500 dark:text-zinc-400">El pedido está vacío</p>
                        <p className="mt-1 max-w-[200px] text-xs text-zinc-400 dark:text-zinc-500">
                            Selecciona platos del menú para agregarlos a la orden.
                        </p>
                    </div>
                ) : (
                    <div className="scrollbar-thin max-h-[45vh] space-y-4 overflow-y-auto pr-1 pb-2">
                        {carrito.map((item) => (
                            <div key={item.producto_id} className="group border-b border-zinc-100 pb-3 last:border-0 last:pb-0 dark:border-zinc-800">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.nombre}</p>
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            {item.cantidad} × {formatPrice(item.precio)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(item.subtotal)}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                            onClick={() => eliminarDelCarrito(item.producto_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Nota del item */}
                                <div className="mt-2 flex items-center gap-2">
                                    <FileText className="h-3 w-3 flex-shrink-0 text-zinc-400" />
                                    <Input
                                        placeholder="Notas de preparación..."
                                        value={item.notas ?? ''}
                                        onChange={(e) => actualizarNotasItem(item.producto_id, e.target.value)}
                                        className="h-7 border-dashed bg-zinc-50/50 text-xs focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-zinc-950/20"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {carrito.length > 0 && (
                    <>
                        {/* Notas generales */}
                        <div className="mt-4 border-t pt-4 dark:border-zinc-800">
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Notas Generales del Pedido
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-shadow duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/20 dark:text-white dark:placeholder-zinc-600 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                                placeholder="Ej: alergias, traer todo junto, cuenta separada..."
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="sticky bottom-0 mt-4 border-t bg-white pt-4 dark:border-zinc-800 dark:bg-zinc-900">
                {carrito.length > 0 && (
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Total a Enviar</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(totalCarrito)}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/50 p-3 text-xs font-medium text-red-700 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <Button
                    className="w-full rounded-xl bg-blue-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-500/10 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/20"
                    disabled={enviando || carrito.length === 0 || !mesaSeleccionada}
                    onClick={handleEnviarPedido}
                >
                    {enviando ? 'Confirmando pedido...' : 'Confirmar Pedido a Cocina'}
                </Button>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Nuevo Pedido" />

            <div className="space-y-6 pb-24 lg:pb-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="h-9 rounded-lg border-zinc-200 px-3 dark:border-zinc-800">
                            <Link href="/pedidos">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                Nuevo Pedido
                            </h1>
                            <p className="text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">Registra un pedido asistido por mesero</p>
                        </div>
                    </div>
                </div>

                {/* Sección 1: Selección de Mesa */}
                <div className="dark:border-zinc-850 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:bg-zinc-900">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Table className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-base font-bold text-zinc-900 sm:text-lg dark:text-white">
                                {mesaSeleccionada ? 'Mesa Seleccionada' : 'Selecciona una Mesa'}
                            </h2>
                        </div>
                        {mesaSeleccionada && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsMesaGridExpanded(!isMesaGridExpanded)}
                                className="h-8 rounded-lg border-zinc-200 px-2.5 text-xs font-semibold dark:border-zinc-800"
                            >
                                {isMesaGridExpanded ? 'Ocultar Mesas' : 'Cambiar Mesa'}
                            </Button>
                        )}
                    </div>

                    {/* Resumen de mesa seleccionada cuando el grid está colapsado */}
                    {!isMesaGridExpanded && mesaSeleccionadaDetalle && (
                        <div className="animate-fade-in flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-950/15">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-600 p-2.5 text-white">
                                    <Table className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-blue-900 dark:text-blue-100">{mesaSeleccionadaDetalle.nombre}</p>
                                    <p className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                        <Store className="h-3 w-3" />
                                        {mesaSeleccionadaDetalle.restaurante?.nombre || 'Restaurante Principal'}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">Activa</Badge>
                        </div>
                    )}

                    {/* Selector interactivo de mesa (Cuadrícula) */}
                    {isMesaGridExpanded && (
                        <div className="animate-slide-down space-y-4">
                            {/* Barra de Filtros para Mesas */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        placeholder="Buscar mesa por nombre o restaurante..."
                                        value={busquedaMesa}
                                        onChange={(e) => setBusquedaMesa(e.target.value)}
                                        className="h-10 rounded-xl border-zinc-200 pl-9 focus-visible:ring-blue-500 dark:border-zinc-800"
                                    />
                                    {busquedaMesa && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                            onClick={() => setBusquedaMesa('')}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex self-start rounded-xl border border-zinc-200 bg-zinc-50 p-1 sm:self-auto dark:border-zinc-800 dark:bg-zinc-950/20">
                                    <button
                                        type="button"
                                        onClick={() => setFiltroMesaEstado('todas')}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                            filtroMesaEstado === 'todas'
                                                ? 'border bg-white text-zinc-900 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
                                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFiltroMesaEstado('disponibles')}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                            filtroMesaEstado === 'disponibles'
                                                ? 'border bg-white text-zinc-900 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
                                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        Disponibles
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFiltroMesaEstado('ocupadas')}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                            filtroMesaEstado === 'ocupadas'
                                                ? 'border bg-white text-zinc-900 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
                                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        Ocupadas
                                    </button>
                                </div>
                            </div>

                            {/* Grid de Mesas */}
                            {mesasAgrupadasPorRestaurante.length === 0 ? (
                                <div className="rounded-xl border border-dashed py-8 text-center text-zinc-400 dark:text-zinc-600">
                                    <Table className="mx-auto mb-2 h-10 w-10 stroke-[1.5] opacity-50" />
                                    <p className="text-sm font-medium">No se encontraron mesas disponibles</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {mesasAgrupadasPorRestaurante.map(([restaurante, mesasDelRestaurante]) => (
                                        <div key={restaurante} className="space-y-3">
                                            <h3 className="flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                                                <Store className="h-3.5 w-3.5" />
                                                {restaurante}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                                                {mesasDelRestaurante.map((mesa) => {
                                                    const isSelected = mesaSeleccionada === mesa.id.toString();
                                                    const isDisponible = mesa.estado === 'disponible';

                                                    return (
                                                        <div
                                                            key={mesa.id}
                                                            onClick={() => {
                                                                setMesaSeleccionada(mesa.id.toString());
                                                                setIsMesaGridExpanded(false);
                                                            }}
                                                            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-200 select-none ${
                                                                isSelected
                                                                    ? 'scale-[1.02] border-blue-600 bg-blue-50/50 font-bold text-blue-900 shadow-xs ring-2 ring-blue-500/20 dark:bg-blue-950/20 dark:text-blue-100'
                                                                    : isDisponible
                                                                      ? 'border-emerald-100 bg-emerald-50/10 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50/20 dark:border-emerald-950/10 dark:text-emerald-400 dark:hover:bg-emerald-950/20'
                                                                      : 'text-amber-850 border-amber-100 bg-amber-50/10 hover:border-amber-300 hover:bg-amber-50/20 dark:border-amber-950/10 dark:text-amber-400 dark:hover:bg-amber-950/20'
                                                            }`}
                                                        >
                                                            <Table
                                                                className={`mb-1.5 h-6 w-6 stroke-[1.5] ${
                                                                    isSelected
                                                                        ? 'text-blue-650 dark:text-blue-400'
                                                                        : isDisponible
                                                                          ? 'text-emerald-555'
                                                                          : 'text-amber-555'
                                                                }`}
                                                            />
                                                            <span className="max-w-full truncate text-sm font-bold">{mesa.nombre}</span>
                                                            <span
                                                                className={`mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                                                    isDisponible
                                                                        ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                        : 'dark:text-amber-450 bg-amber-100/70 text-amber-800 dark:bg-amber-950/50'
                                                                }`}
                                                            >
                                                                {mesa.estado}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 rounded-full bg-blue-600 p-0.5 text-white shadow-sm">
                                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel izquierdo: Menú y platos */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Menú Header y filtros */}
                        <div className="dark:border-zinc-850 space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:bg-zinc-900">
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <h2 className="flex items-center gap-2 self-start text-lg font-bold text-zinc-900 sm:self-auto dark:text-white">
                                    <Utensils className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Menú de Platos
                                </h2>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        placeholder="Buscar platos o descripción..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="h-10 rounded-xl border-zinc-200 pl-9 focus-visible:ring-blue-500 dark:border-zinc-800"
                                    />
                                    {busqueda && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                            onClick={() => setBusqueda('')}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Carrusel/Deslizable de Categorías */}
                            <div className="scrollbar-none -mx-5 flex items-center gap-2 overflow-x-auto border-b px-5 pb-2 sm:mx-0 sm:px-0 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setCategoriaActiva('todas')}
                                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                                        categoriaActiva === 'todas'
                                            ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950'
                                            : 'text-zinc-650 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950/30'
                                    }`}
                                >
                                    <span>Todas</span>
                                    <span
                                        className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                                            categoriaActiva === 'todas'
                                                ? 'bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-950'
                                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                    >
                                        {conteoPorCategoria['todas'] ?? 0}
                                    </span>
                                </button>
                                {categorias.map((cat) => {
                                    const isActive = categoriaActiva === cat.id.toString();
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoriaActiva(cat.id.toString())}
                                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950'
                                                    : 'text-zinc-650 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950/30'
                                            }`}
                                        >
                                            {getCategoriaIcon(cat.nombre)}
                                            <span>{cat.nombre}</span>
                                            <span
                                                className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                                                    isActive
                                                        ? 'bg-white/20 text-white dark:bg-zinc-900/10 dark:text-zinc-950'
                                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}
                                            >
                                                {conteoPorCategoria[cat.id.toString()] ?? 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Listado de Platos */}
                        {!mesaSeleccionada ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                                <Table className="mb-4 h-12 w-12 stroke-[1.5] text-zinc-300 dark:text-zinc-700" />
                                <h3 className="text-zinc-850 dark:text-zinc-250 text-lg font-bold">Mesa requerida</h3>
                                <p className="mt-1 max-w-[280px] text-sm text-zinc-500 dark:text-zinc-400">
                                    Por favor selecciona una mesa en la sección superior antes de agregar platos al pedido.
                                </p>
                                <Button
                                    onClick={() => {
                                        setIsMesaGridExpanded(true);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="mt-4 h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
                                >
                                    Seleccionar Mesa Ahora
                                </Button>
                            </div>
                        ) : platosFiltrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                                <Utensils className="mb-4 h-12 w-12 stroke-[1.5] text-zinc-300 dark:text-zinc-700" />
                                <h3 className="text-zinc-850 dark:text-zinc-250 text-lg font-bold">No hay platos disponibles</h3>
                                <p className="mt-1 max-w-[280px] text-sm text-zinc-500 dark:text-zinc-400">
                                    No se encontraron platos que coincidan con la búsqueda en esta sucursal.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {platosFiltrados.map((plato) => {
                                    const qty = cantidadEnCarrito(plato.id);

                                    return (
                                        <div
                                            key={plato.id}
                                            className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-md dark:bg-zinc-900 ${
                                                qty > 0
                                                    ? 'border-blue-200 ring-2 ring-blue-500/5 dark:border-blue-800 dark:ring-blue-500/10'
                                                    : 'dark:border-zinc-850 border-zinc-200'
                                            }`}
                                        >
                                            {/* Imagen del plato o fallback */}
                                            {plato.imagen ? (
                                                <img
                                                    src={plato.imagen}
                                                    alt={plato.nombre}
                                                    className="h-20 w-20 flex-shrink-0 rounded-xl border bg-zinc-50 object-cover sm:h-24 sm:w-24 dark:border-zinc-800"
                                                />
                                            ) : (
                                                <div className="bg-zinc-55/70 dark:text-zinc-650 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border text-zinc-400 sm:h-24 sm:w-24 dark:border-zinc-800 dark:bg-zinc-950">
                                                    {plato.categoria ? (
                                                        getCategoriaIcon(plato.categoria.nombre)
                                                    ) : (
                                                        <Utensils className="h-6 w-6 stroke-[1.5]" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Info plato */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-1.5">
                                                        <h3 className="truncate text-sm font-extrabold text-zinc-900 sm:text-base dark:text-white">
                                                            {plato.nombre}
                                                        </h3>
                                                        {plato.categoria && (
                                                            <Badge
                                                                variant="outline"
                                                                className="shrink-0 border-zinc-200 px-1.5 py-0 text-[9px] font-bold tracking-wider uppercase dark:border-zinc-800 dark:text-zinc-400"
                                                            >
                                                                {plato.categoria.nombre}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {plato.descripcion && (
                                                        <p className="text-zinc-550 mt-1 line-clamp-2 text-[11px] leading-normal sm:text-xs dark:text-zinc-400">
                                                            {plato.descripcion}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center justify-between gap-2">
                                                    <span className="text-sm font-extrabold text-emerald-600 sm:text-base dark:text-emerald-400">
                                                        {formatPrice(plato.precio)}
                                                    </span>

                                                    {/* Control de cantidad inteligente */}
                                                    <div className="flex items-center gap-1.5">
                                                        {qty > 0 ? (
                                                            <div className="flex items-center gap-1 rounded-lg border bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-950">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-md text-zinc-500 transition-colors hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-900"
                                                                    onClick={() => actualizarCantidad(plato.id, -1)}
                                                                >
                                                                    <Minus className="h-3 w-3 stroke-[2.5]" />
                                                                </Button>
                                                                <span className="w-5 text-center text-xs font-black text-zinc-800 dark:text-zinc-200">
                                                                    {qty}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-md text-zinc-500 transition-colors hover:bg-white dark:text-zinc-400 dark:hover:bg-zinc-900"
                                                                    onClick={() => agregarAlCarrito(plato)}
                                                                >
                                                                    <Plus className="h-3 w-3 stroke-[2.5]" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-zinc-250 h-8 rounded-lg text-xs font-bold transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950/30"
                                                                onClick={() => agregarAlCarrito(plato)}
                                                            >
                                                                <Plus className="mr-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                                Agregar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Panel derecho: Carrito de Compras (Escritorio) */}
                    <div className="hidden lg:block">
                        <Card className="dark:border-zinc-850 sticky top-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:bg-zinc-900">
                            <CardContent className="p-0">{renderCarrito()}</CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Barra flotante inferior (Móvil) */}
            {totalCantidadItems > 0 && (
                <div className="animate-bounce-subtle fixed right-4 bottom-4 left-4 z-40 lg:hidden">
                    <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="from-blue-650 to-indigo-650 flex w-full items-center justify-between rounded-2xl border border-blue-500/20 bg-gradient-to-r p-4 text-white shadow-xl transition-all duration-150 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative rounded-xl bg-white/20 p-2.5">
                                        <ShoppingCart className="h-5 w-5" />
                                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-600 bg-red-500 text-[10px] font-black text-white">
                                            {totalCantidadItems}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-blue-105 text-xs font-bold opacity-90">Ver Pedido</p>
                                        <p className="text-sm font-black tracking-tight">{formatPrice(totalCarrito)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold transition-colors hover:bg-white/20">
                                    Revisar Orden
                                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                                </div>
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="flex h-full w-full flex-col justify-between border-l border-zinc-200 bg-white p-6 sm:max-w-md dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <SheetHeader className="border-b p-0 pb-4 dark:border-zinc-800">
                                <SheetTitle className="text-zinc-905 flex items-center gap-2 text-xl font-black dark:text-zinc-50">
                                    <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Detalle del Pedido
                                </SheetTitle>
                                <SheetDescription className="text-xs text-zinc-500">
                                    {mesaSeleccionadaDetalle
                                        ? `Mesa: ${mesaSeleccionadaDetalle.nombre} | ${mesaSeleccionadaDetalle.restaurante?.nombre || 'Principal'}`
                                        : 'Por favor, selecciona una mesa.'}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto py-4">{renderCarrito()}</div>
                        </SheetContent>
                    </Sheet>
                </div>
            )}
        </AppLayout>
    );
}
