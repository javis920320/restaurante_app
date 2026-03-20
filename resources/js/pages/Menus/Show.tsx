import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { type BreadcrumbItem, type Categoria, type Menu, type Plato, type Restaurante } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ChevronLeft, PackageOpen, Plus, QrCode, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

const PRODUCTION_AREA_OPTIONS = [
    { value: 'none', label: 'Sin área' },
    { value: 'kitchen', label: '🍳 Cocina' },
    { value: 'bar', label: '🍹 Bar' },
] as const;

const PRODUCTION_AREA_LABELS: Record<string, string> = {
    none: 'Sin área',
    kitchen: '🍳 Cocina',
    bar: '🍹 Bar',
};

interface Props {
    menu: Menu;
    restaurantes: Restaurante[];
}

export default function MenuShow({ menu: initialMenu }: Props) {
    const [menu, setMenu] = useState<Menu>(initialMenu);
    const [categorias, setCategorias] = useState<Categoria[]>((initialMenu.categorias ?? []) as Categoria[]);

    // Categoría form
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [nuevaCategoriaArea, setNuevaCategoriaArea] = useState<'none' | 'kitchen' | 'bar'>('none');
    const [categoriaError, setCategoriaError] = useState('');
    const [savingCategoria, setSavingCategoria] = useState(false);

    // Plato inline form
    const [platoFormCategoriaId, setPlatoFormCategoriaId] = useState<number | null>(null);
    const [nuevoPlato, setNuevoPlato] = useState({ nombre: '', precio: '', descripcion: '', stock: '', production_area: 'none' as 'none' | 'kitchen' | 'bar' });
    const [platoError, setPlatoError] = useState('');
    const [savingPlato, setSavingPlato] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menús', href: '/configuracion/menus' },
        { title: menu.nombre, href: `/configuracion/menus/${menu.id}` },
    ];

    const handleToggleEstado = async () => {
        try {
            const response = await axios.post(route('menus.toggle-estado', menu.id));
            setMenu(response.data.menu);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                alert(error.response.data.message);
            }
        }
    };

    const handleGenerarQR = async () => {
        try {
            const response = await axios.get(route('menus.generar-qr', menu.id));
            const url = response.data.url;
            // Open the public menu URL in new tab
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
        }
    };

    const handleCrearCategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoriaError('');
        setSavingCategoria(true);
        try {
            const response = await axios.post(route('categorias.store'), {
                nombre: nuevaCategoria,
                menu_id: menu.id,
                production_area: nuevaCategoriaArea,
            });
            setCategorias((prev) => [...prev, { ...response.data.categorianew, platos: [] }]);
            setNuevaCategoria('');
            setNuevaCategoriaArea('none');
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setCategoriaError(error.response.data.message);
            }
        } finally {
            setSavingCategoria(false);
        }
    };

    const handleToggleCategoria = async (id: number) => {
        try {
            const response = await axios.post(route('categorias.toggle-activo', id));
            setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, activo: response.data.categoria.activo } : c)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminarCategoria = async (id: number) => {
        if (!confirm('¿Eliminar esta categoría? Se eliminarán sus productos.')) return;
        try {
            await axios.delete(route('categorias.destroy', id));
            setCategorias((prev) => prev.filter((c) => c.id !== id));
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                alert(error.response.data.message);
            }
        }
    };

    const handleCrearPlato = async (categoriaId: number, e: React.FormEvent) => {
        e.preventDefault();
        setPlatoError('');
        setSavingPlato(true);
        try {
            const response = await axios.post(route('platos.store'), {
                nombre: nuevoPlato.nombre,
                precio: nuevoPlato.precio,
                descripcion: nuevoPlato.descripcion,
                stock: nuevoPlato.stock || null,
                categoria_id: categoriaId,
                activo: true,
                disponible: true,
                production_area: nuevoPlato.production_area,
            });
            const platoNuevo: Plato = response.data.plato;
            setCategorias((prev) =>
                prev.map((c) => (c.id === categoriaId ? { ...c, platos: [...(c.platos ?? []), platoNuevo] } : c)),
            );
            setNuevoPlato({ nombre: '', precio: '', descripcion: '', stock: '', production_area: 'none' });
            setPlatoFormCategoriaId(null);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setPlatoError(error.response.data.message);
            }
        } finally {
            setSavingPlato(false);
        }
    };

    const handleEliminarPlato = async (categoriaId: number, platoId: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await axios.delete(route('platos.destroy', platoId));
            setCategorias((prev) =>
                prev.map((c) => (c.id === categoriaId ? { ...c, platos: (c.platos ?? []).filter((p) => p.id !== platoId) } : c)),
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Menú: ${menu.nombre}`} />
            <ConfiguracionLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <button
                                onClick={() => router.visit(route('menus.index'))}
                                className="text-muted-foreground mb-1 flex items-center gap-1 text-sm hover:underline"
                            >
                                <ChevronLeft className="h-4 w-4" /> Volver a Menús
                            </button>
                            <h3 className="text-lg font-medium">{menu.nombre}</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant={menu.estado === 'publicado' ? 'default' : 'secondary'}>
                                    {menu.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                                </Badge>
                                <span className="text-muted-foreground font-mono text-xs">/menu-publico/{menu.slug}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={menu.estado === 'publicado' ? 'outline' : 'default'}
                                onClick={handleToggleEstado}
                            >
                                {menu.estado === 'publicado' ? 'Despublicar' : 'Publicar Menú'}
                            </Button>
                            {menu.estado === 'publicado' && (
                                <Button size="sm" variant="outline" onClick={handleGenerarQR}>
                                    <QrCode className="mr-1 h-4 w-4" /> Ver URL Pública
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Agregar categoría */}
                    <form onSubmit={handleCrearCategoria} className="rounded-lg border p-4">
                        <h4 className="mb-3 font-medium">Nueva categoría</h4>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="nueva-cat">Nombre</Label>
                                <Input
                                    id="nueva-cat"
                                    value={nuevaCategoria}
                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                    placeholder="Ej: Bebidas, Platos fuertes, Postres..."
                                />
                                {categoriaError && <p className="text-destructive text-xs">{categoriaError}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="nueva-cat-area">Área de producción</Label>
                                <Select value={nuevaCategoriaArea} onValueChange={(v) => setNuevaCategoriaArea(v as 'none' | 'kitchen' | 'bar')}>
                                    <SelectTrigger id="nueva-cat-area" className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRODUCTION_AREA_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={savingCategoria}>
                                <Plus className="mr-1 h-4 w-4" />
                                {savingCategoria ? 'Agregando...' : 'Agregar Categoría'}
                            </Button>
                        </div>
                    </form>

                    {/* Lista de categorías y productos */}
                    {categorias.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                            <Tag className="mb-2 h-8 w-8 opacity-40" />
                            <p>No hay categorías. Agrega una para empezar.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categorias.map((categoria) => (
                                <div key={categoria.id} className="rounded-lg border">
                                    {/* Categoría header */}
                                    <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{categoria.nombre}</span>
                                            <Badge variant={categoria.activo ? 'default' : 'secondary'} className="text-xs">
                                                {categoria.activo ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                            {categoria.production_area && categoria.production_area !== 'none' && (
                                                <Badge variant="outline" className="text-xs">
                                                    {PRODUCTION_AREA_LABELS[categoria.production_area]}
                                                </Badge>
                                            )}
                                            <span className="text-muted-foreground text-xs">
                                                {(categoria.platos ?? []).length} producto(s)
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setPlatoFormCategoriaId(platoFormCategoriaId === categoria.id ? null : categoria.id);
                                                    setNuevoPlato({
                                                        nombre: '',
                                                        precio: '',
                                                        descripcion: '',
                                                        stock: '',
                                                        production_area: (categoria.production_area ?? 'none') as 'none' | 'kitchen' | 'bar',
                                                    });
                                                    setPlatoError('');
                                                }}
                                            >
                                                <Plus className="mr-1 h-4 w-4" /> Agregar Producto
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleToggleCategoria(categoria.id)}>
                                                {categoria.activo ? 'Desactivar' : 'Activar'}
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleEliminarCategoria(categoria.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Formulario inline para nuevo plato */}
                                    {platoFormCategoriaId === categoria.id && (
                                        <form onSubmit={(e) => handleCrearPlato(categoria.id, e)} className="border-b bg-muted/20 p-4">
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                <div className="space-y-1">
                                                    <Label>Nombre *</Label>
                                                    <Input
                                                        value={nuevoPlato.nombre}
                                                        onChange={(e) => setNuevoPlato((p) => ({ ...p, nombre: e.target.value }))}
                                                        placeholder="Nombre del producto"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Precio *</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={nuevoPlato.precio}
                                                        onChange={(e) => setNuevoPlato((p) => ({ ...p, precio: e.target.value }))}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Área de producción</Label>
                                                    <Select
                                                        value={nuevoPlato.production_area}
                                                        onValueChange={(v) => setNuevoPlato((p) => ({ ...p, production_area: v as 'none' | 'kitchen' | 'bar' }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PRODUCTION_AREA_OPTIONS.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Descripción</Label>
                                                    <Input
                                                        value={nuevoPlato.descripcion}
                                                        onChange={(e) => setNuevoPlato((p) => ({ ...p, descripcion: e.target.value }))}
                                                        placeholder="Descripción breve"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Stock</Label>
                                                    <Input
                                                        type="number"
                                                        value={nuevoPlato.stock}
                                                        onChange={(e) => setNuevoPlato((p) => ({ ...p, stock: e.target.value }))}
                                                        placeholder="Cantidad (opcional)"
                                                    />
                                                </div>
                                            </div>
                                            {platoError && <p className="text-destructive mt-2 text-xs">{platoError}</p>}
                                            <div className="mt-3 flex gap-2">
                                                <Button type="submit" size="sm" disabled={savingPlato}>
                                                    {savingPlato ? 'Guardando...' : 'Guardar Producto'}
                                                </Button>
                                                <Button type="button" size="sm" variant="outline" onClick={() => setPlatoFormCategoriaId(null)}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Lista de platos */}
                                    {(categoria.platos ?? []).length === 0 ? (
                                        <div className="text-muted-foreground flex items-center gap-2 px-4 py-6 text-sm">
                                            <PackageOpen className="h-4 w-4" />
                                            Sin productos. Haz clic en "Agregar Producto".
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {(categoria.platos ?? []).map((plato) => (
                                                <div key={plato.id} className="flex items-center justify-between px-4 py-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{plato.nombre}</span>
                                                            {!plato.activo && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Inactivo
                                                                </Badge>
                                                            )}
                                                            {plato.stock !== null && plato.stock !== undefined && plato.stock === 0 && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Agotado
                                                                </Badge>
                                                            )}
                                                            {plato.production_area && plato.production_area !== 'none' && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {PRODUCTION_AREA_LABELS[plato.production_area]}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-muted-foreground text-xs">
                                                            ${Number(plato.precio).toFixed(2)}
                                                            {plato.descripcion && ` · ${plato.descripcion}`}
                                                            {plato.stock !== null && plato.stock !== undefined && ` · Stock: ${plato.stock}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.visit(route('platos.edit', plato.id))}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleEliminarPlato(categoria.id, plato.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
