import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { type BreadcrumbItem, type Menu, type Restaurante } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { BookOpen, Eye, QrCode, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menús',
        href: '/configuracion/menus',
    },
];

interface Props {
    menus: Menu[];
    restaurantes: Restaurante[];
}

export default function MenusIndex({ menus: initialMenus, restaurantes }: Props) {
    const [menus, setMenus] = useState<Menu[]>(initialMenus);
    const [nombre, setNombre] = useState('');
    const [restauranteId, setRestauranteId] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            const response = await axios.post(route('menus.store'), {
                nombre,
                restaurante_id: restauranteId,
            });
            setMenus((prev) => [response.data.menu, ...prev]);
            setNombre('');
            setRestauranteId('');
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este menú?')) return;
        try {
            await axios.delete(route('menus.destroy', id));
            setMenus((prev) => prev.filter((m) => m.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleEstado = async (id: number) => {
        try {
            const response = await axios.post(route('menus.toggle-estado', id));
            setMenus((prev) => prev.map((m) => (m.id === id ? response.data.menu : m)));
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                alert(error.response.data.message);
            }
        }
    };

    const handleGenerarQR = async (id: number) => {
        try {
            const response = await axios.get(route('menus.generar-qr', id));
            const url = response.data.url;
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menús" />
            <ConfiguracionLayout>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Menús Digitales</h3>
                        <p className="text-muted-foreground text-sm">
                            Crea y administra menús digitales con código QR para tus restaurantes.
                        </p>
                    </div>

                    {/* Formulario de creación */}
                    <form onSubmit={handleCreate} className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-medium">Nuevo Menú</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="nombre">Nombre del menú</Label>
                                <Input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Menú Principal, Carta de Bebidas..."
                                />
                                {errors.nombre && <InputError message={errors.nombre} />}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="restaurante">Restaurante</Label>
                                <Select value={restauranteId} onValueChange={setRestauranteId}>
                                    <SelectTrigger id="restaurante">
                                        <SelectValue placeholder="Seleccionar restaurante" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurantes.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.restaurante_id && <InputError message={errors.restaurante_id} />}
                            </div>
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Creando...' : 'Crear Menú'}
                        </Button>
                    </form>

                    {/* Lista de menús */}
                    {menus.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                            <BookOpen className="mb-2 h-8 w-8 opacity-40" />
                            <p>No hay menús creados aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {menus.map((menu) => (
                                <div key={menu.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{menu.nombre}</span>
                                            <Badge variant={menu.estado === 'publicado' ? 'default' : 'secondary'}>
                                                {menu.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {menu.restaurante?.nombre} · {menu.categorias_count ?? 0} categoría(s)
                                        </p>
                                        <p className="text-muted-foreground font-mono text-xs">/menu-publico/{menu.slug}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={menu.estado === 'publicado' ? 'outline' : 'default'}
                                            onClick={() => handleToggleEstado(menu.id)}
                                        >
                                            {menu.estado === 'publicado' ? 'Despublicar' : 'Publicar'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.visit(route('menus.show', menu.id))}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {menu.estado === 'publicado' && (
                                            <Button size="sm" variant="outline" onClick={() => handleGenerarQR(menu.id)}>
                                                <QrCode className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(menu.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
