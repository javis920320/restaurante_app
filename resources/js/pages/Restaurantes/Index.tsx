import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Restaurante {
    id: number;
    nombre: string;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    activo: boolean;
    mesas_count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Restaurantes',
        href: '/configuracion/restaurantes',
    },
];

export default function RestaurantesIndex({ restaurantes }: { restaurantes: Restaurante[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const createForm = useForm({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true,
    });

    const editForm = useForm({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('restaurantes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
            },
        });
    };

    const startEditing = (restaurante: Restaurante) => {
        setEditingId(restaurante.id);
        editForm.setData({
            nombre: restaurante.nombre,
            direccion: restaurante.direccion ?? '',
            telefono: restaurante.telefono ?? '',
            email: restaurante.email ?? '',
            activo: restaurante.activo,
        });
    };

    const handleUpdate = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(route('restaurantes.update', id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este restaurante?')) return;
        editForm.delete(route('restaurantes.destroy', id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Restaurantes" />
            <ConfiguracionLayout>
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Gestión de Restaurantes</h1>
                    <p className="mt-2 text-gray-600">Aquí puedes gestionar los restaurantes de la aplicación.</p>

                    {/* Formulario para crear nuevo restaurante */}
                    <div className="mt-6 rounded-md border p-4">
                        <h2 className="mb-3 text-lg font-semibold">Nuevo Restaurante</h2>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nombre del restaurante *"
                                    className="w-full rounded-md border p-2"
                                    value={createForm.data.nombre}
                                    onChange={(e) => createForm.setData('nombre', e.target.value)}
                                />
                                <InputError message={createForm.errors.nombre} />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Dirección"
                                    className="w-full rounded-md border p-2"
                                    value={createForm.data.direccion}
                                    onChange={(e) => createForm.setData('direccion', e.target.value)}
                                />
                                <InputError message={createForm.errors.direccion} />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Teléfono"
                                        className="w-full rounded-md border p-2"
                                        value={createForm.data.telefono}
                                        onChange={(e) => createForm.setData('telefono', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.telefono} />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        placeholder="Correo electrónico"
                                        className="w-full rounded-md border p-2"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.email} />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                                {createForm.processing ? 'Guardando...' : 'Agregar Restaurante +'}
                            </button>
                        </form>
                    </div>

                    {/* Lista de restaurantes */}
                    {restaurantes.length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-xl font-semibold">Lista de Restaurantes</h2>
                            <ul className="space-y-3">
                                {restaurantes.map((restaurante) => (
                                    <li key={restaurante.id} className="rounded-md border p-3">
                                        {editingId === restaurante.id ? (
                                            <form onSubmit={(e) => handleUpdate(e, restaurante.id)} className="space-y-2">
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="w-full rounded-md border p-2"
                                                        value={editForm.data.nombre}
                                                        onChange={(e) => editForm.setData('nombre', e.target.value)}
                                                    />
                                                    <InputError message={editForm.errors.nombre} />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Dirección"
                                                        className="w-full rounded-md border p-2"
                                                        value={editForm.data.direccion}
                                                        onChange={(e) => editForm.setData('direccion', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Teléfono"
                                                        className="flex-1 rounded-md border p-2"
                                                        value={editForm.data.telefono}
                                                        onChange={(e) => editForm.setData('telefono', e.target.value)}
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Correo"
                                                        className="flex-1 rounded-md border p-2"
                                                        value={editForm.data.email}
                                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-1 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.data.activo}
                                                            onChange={(e) => editForm.setData('activo', e.target.checked)}
                                                        />
                                                        Activo
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={editForm.processing}
                                                        className="rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingId(null)}
                                                        className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">{restaurante.nombre}</span>
                                                    {!restaurante.activo && (
                                                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                    {restaurante.direccion && (
                                                        <p className="text-sm text-gray-500">{restaurante.direccion}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400">{restaurante.mesas_count} mesa(s)</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditing(restaurante)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(restaurante.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {restaurantes.length === 0 && (
                        <div className="mt-6 rounded-md bg-yellow-50 p-4 text-center">
                            <p className="text-yellow-700">No hay restaurantes registrados. Crea uno para comenzar.</p>
                        </div>
                    )}
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
