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
    const [listCategorias, setCategorias] = useState<Categoria[]>(categorias); // Estado para las categorías
    const categoriaExist = listCategorias.length > 0 ? true : false; // Verifica si hay categorías
    const {
        setData,
        data,
        errors,
        setError,
        delete: destroy,
    } = useForm({
        nombre: '',
    });
    const CategoriaNueva: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('categorias.store'), { nombre: data.nombre });

            setCategorias((prev) => [...prev, response.data.categorianew]); // Agrega la nueva categoría
            setData('nombre', ''); // Limpia el campo de entrada
        } catch (error) {
            console.log(error.response.data.message);
            //console.log(error.response?.data?.errors || error.message);
            setError('nombre', error.response.data.message);
        }
    };
    const eliminarCategoria = (id: number) => {
        // Aquí puedes agregar la lógica para eliminar la categoría
        // Por ejemplo, puedes hacer una solicitud POST a tu backend para eliminar la categoría
        destroy(route('categorias.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <ConfiguracionLayout>
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
                    <p className="mt-2 text-gray-600">Aquí puedes gestionar las categorías de los platos.</p>

                    {categoriaExist && (
                        <div>
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
                            <h2 className="text-xl font-semibold">Lista de Categorías</h2>
                            <ul className="mt-2 space-y-2">
                                {listCategorias.map((categoria) => (
                                    <li key={categoria.id} className="flex justify-between rounded-md border p-2">
                                        <span>{categoria.nombre}</span>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => eliminarCategoria(categoria.id)}>
                                            Eliminar{' '}
                                        </button>
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
