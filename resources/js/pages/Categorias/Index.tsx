import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { type BreadcrumbItem, type Categoria } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categorias',
        href: '/categorias',
    },
];
export default function CategoriasIndex({ categorias }: { categorias: Categoria[] }) {
    const [listCategorias, setCategorias] = useState<Categoria[]>(categorias);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const categoriaExist = listCategorias.length > 0 ? true : false;
    const {
        setData,
        data,
        errors,
        setError,
    } = useForm({
        nombre: '',
    });
    const CategoriaNueva: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('categorias.store'), { nombre: data.nombre });

            setCategorias((prev) => [...prev, response.data.categorianew]);
            setData('nombre', '');
        } catch (error) {
            console.log(error.response.data.message);
            setError('nombre', error.response.data.message);
        }
    };

    const toggleActivo = async (id: number) => {
        try {
            const response = await axios.post(route('categorias.toggle-activo', id));
            setCategorias((prev) =>
                prev.map((cat) => (cat.id === id ? { ...cat, activo: response.data.categoria.activo } : cat)),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminar = async (id: number) => {
        setDeleteError(null);
        try {
            await axios.delete(route('categorias.destroy', id));
            setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
        } catch (error) {
            if (error?.response?.status === 422) {
                setDeleteError(error.response.data.message);
            } else {
                console.error(error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <ConfiguracionLayout>
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
                    <p className="mt-2 text-gray-600">Aquí puedes gestionar las categorías de los platos.</p>

                    <form onSubmit={CategoriaNueva} className="mt-4 flex items-center">
                        <input
                            type="text"
                            placeholder="Nueva Categoria..."
                            className="rounded-md border p-2"
                            onChange={(e) => setData('nombre', e.target.value)}
                            value={data.nombre}
                        />
                        <button type="submit" className="ml-2 rounded-md bg-blue-500 p-2 text-white">
                            Agregar +
                        </button>
                    </form>
                    <div>
                        <InputError message={errors.nombre} />
                    </div>

                    {deleteError && (
                        <div className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">{deleteError}</div>
                    )}

                    {categoriaExist && (
                        <div>
                            <h2 className="mt-4 text-xl font-semibold">Lista de Categorías</h2>
                            <ul className="mt-2 space-y-2">
                                {listCategorias.map((categoria) => (
                                    <li key={categoria.id} className="flex items-center justify-between rounded-md border p-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full ${categoria.activo ? 'bg-green-500' : 'bg-gray-400'}`}
                                            />
                                            <span className={categoria.activo ? '' : 'text-gray-400 line-through'}>
                                                {categoria.nombre}
                                            </span>
                                            {categoria.platos_count !== undefined && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                    {categoria.platos_count} platos
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className={`rounded px-2 py-1 text-sm ${categoria.activo ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                onClick={() => toggleActivo(categoria.id)}
                                            >
                                                {categoria.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleEliminar(categoria.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}