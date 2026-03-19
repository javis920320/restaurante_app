import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import pedidoService, { PedidoItem } from '@/services/pedidoService';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';

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
    const [carrito, setCarrito] = useState<CarritoItem[]>([]);
    const [notas, setNotas] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

    // Agrupar categorías únicas de los platos
    const categorias = useMemo(() => {
        const map = new Map<number, Categoria>();
        platos.forEach((p) => {
            if (p.categoria) map.set(p.categoria.id, p.categoria);
        });
        return Array.from(map.values());
    }, [platos]);

    // Filtrar platos por categoría y búsqueda
    const platosFiltrados = useMemo(() => {
        return platos.filter((p) => {
            const coincideCategoria = categoriaActiva === 'todas' || (p.categoria && p.categoria.id.toString() === categoriaActiva);
            const coincideBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
            return coincideCategoria && coincideBusqueda;
        });
    }, [platos, categoriaActiva, busqueda]);

    const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);

    const agregarAlCarrito = (plato: Plato) => {
        setCarrito((prev) => {
            const existing = prev.find((item) => item.producto_id === plato.id);
            if (existing) {
                return prev.map((item) =>
                    item.producto_id === plato.id
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    producto_id: plato.id,
                    nombre: plato.nombre,
                    precio: plato.precio,
                    cantidad: 1,
                    subtotal: plato.precio,
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
                items: carrito.map(({ producto_id, cantidad, notas }) => ({ producto_id, cantidad, notas })),
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

    return (
        <AppLayout>
            <Head title="Nuevo Pedido" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/pedidos">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nuevo Pedido</h1>
                        <p className="mt-1 text-gray-600">Registra un pedido asistido por mesero</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel izquierdo: selección de mesa + menú */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Selección de mesa */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Mesa *</label>
                            <Select value={mesaSeleccionada} onValueChange={setMesaSeleccionada}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar mesa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mesas.map((mesa) => (
                                        <SelectItem key={mesa.id} value={mesa.id.toString()}>
                                            {mesa.nombre}
                                            {mesa.estado !== 'disponible' && (
                                                <span className="ml-2 text-xs text-orange-500">({mesa.estado})</span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filtros de menú */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Buscar plato..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>
                                <div className="sm:w-52">
                                    <Select value={categoriaActiva} onValueChange={setCategoriaActiva}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todas">Todas las categorías</SelectItem>
                                            {categorias.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Lista de platos */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {platosFiltrados.length === 0 && (
                                <p className="col-span-2 py-8 text-center text-gray-500">No hay platos disponibles</p>
                            )}
                            {platosFiltrados.map((plato) => {
                                const qty = cantidadEnCarrito(plato.id);
                                return (
                                    <div
                                        key={plato.id}
                                        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${qty > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium text-gray-900">{plato.nombre}</p>
                                            {plato.categoria && (
                                                <p className="text-xs text-gray-500">{plato.categoria.nombre}</p>
                                            )}
                                            <p className="mt-1 font-semibold text-green-600">{formatPrice(plato.precio)}</p>
                                        </div>
                                        <div className="ml-3 flex items-center gap-2">
                                            {qty > 0 ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => actualizarCantidad(plato.id, -1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-6 text-center font-bold">{qty}</span>
                                                </>
                                            ) : null}
                                            <Button
                                                variant={qty > 0 ? 'default' : 'outline'}
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => agregarAlCarrito(plato)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panel derecho: carrito */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Pedido</h2>
                                {carrito.length > 0 && (
                                    <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                                        {carrito.reduce((s, i) => s + i.cantidad, 0)}
                                    </span>
                                )}
                            </div>

                            {carrito.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-500">Agrega productos al pedido</p>
                            ) : (
                                <div className="space-y-3">
                                    {carrito.map((item) => (
                                        <div key={item.producto_id} className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">{item.nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.cantidad} × {formatPrice(item.precio)}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                                onClick={() => eliminarDelCarrito(item.producto_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="text-xl font-bold text-green-600">{formatPrice(totalCarrito)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notas */}
                            <div className="mt-4">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Notas del pedido</label>
                                <textarea
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Indicaciones especiales..."
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Enviar */}
                            <Button
                                className="mt-4 w-full"
                                size="lg"
                                disabled={enviando || carrito.length === 0 || !mesaSeleccionada}
                                onClick={handleEnviarPedido}
                            >
                                {enviando ? 'Enviando...' : 'Enviar Pedido a Cocina'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
