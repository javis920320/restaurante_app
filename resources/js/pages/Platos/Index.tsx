import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Categoria, type Opcion, type Plato } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import Formulario from './Formulario';

export default function Index({ categorias, platos }: { categorias: { id: number; nombre: string }[]; platos: { data: Plato[] } | Plato[] }) {
    const platosArray: Plato[] = Array.isArray(platos) ? platos : (platos as { data: Plato[] }).data;
    const [listaPlatos, setListaPlatos] = React.useState<Plato[]>(platosArray);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<Categoria[]>([]);

    // Opciones management state
    const [opcionesPlato, setOpcionesPlato] = useState<number | null>(null);
    const [nuevaOpcion, setNuevaOpcion] = useState({ nombre: '', precio_extra: 0 });
    const [opcionError, setOpcionError] = useState<string | null>(null);

    const handleClickCategoria = (categoriaId: number) => {
        setCategoriaSeleccionada((prevCategorias: Categoria[]) => {
            const existeCategoria = prevCategorias.some((cat) => cat.id === categoriaId);
            let nuevasCategorias;

            if (existeCategoria) {
                nuevasCategorias = prevCategorias.filter((cat) => cat.id !== categoriaId);
            } else {
                const categoria = categorias.find((cat) => cat.id === categoriaId);
                nuevasCategorias = categoria ? [...prevCategorias, categoria] : prevCategorias;
            }

            if (nuevasCategorias.length > 0) {
                setListaPlatos(platosArray.filter((plato) => nuevasCategorias.some((categoria) => categoria.id === plato.categoria_id)));
            } else {
                setListaPlatos(platosArray);
            }

            return nuevasCategorias;
        });
    };

    const toggleActivo = async (id: number) => {
        try {
            const response = await axios.post(route('platos.toggle-activo', id));
            setListaPlatos((prev) => prev.map((p) => (p.id === id ? { ...p, activo: response.data.plato.activo } : p)));
        } catch (error) {
            console.error(error);
        }
    };

    const toggleDisponible = async (id: number) => {
        try {
            const response = await axios.post(route('platos.toggle-disponible', id));
            setListaPlatos((prev) => prev.map((p) => (p.id === id ? { ...p, disponible: response.data.plato.disponible } : p)));
        } catch (error) {
            console.error(error);
        }
    };

    const agregarOpcion = async (platoId: number) => {
        setOpcionError(null);
        try {
            const response = await axios.post(route('platos.opciones.store', platoId), nuevaOpcion);
            setListaPlatos((prev) =>
                prev.map((p) =>
                    p.id === platoId ? { ...p, opciones: [...(p.opciones || []), response.data.opcion] } : p,
                ),
            );
            setNuevaOpcion({ nombre: '', precio_extra: 0 });
        } catch (error) {
            const msg =
                error?.response?.data?.errors
                    ? Object.values(error.response.data.errors as Record<string, string[]>)
                          .flat()
                          .join(' ')
                    : error?.response?.data?.message || 'Error al agregar opción.';
            setOpcionError(msg);
        }
    };

    const eliminarOpcion = async (platoId: number, opcionId: number) => {
        try {
            await axios.delete(route('platos.opciones.destroy', { plato: platoId, opcion: opcionId }));
            setListaPlatos((prev) =>
                prev.map((p) =>
                    p.id === platoId ? { ...p, opciones: (p.opciones || []).filter((o: Opcion) => o.id !== opcionId) } : p,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlatoCreado = () => {
        router.reload({ only: ['platos'] });
    };

    return (
        <AppLayout>
            <Head title="Platos" />
            <ConfiguracionLayout>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Platos</h1>
                </div>
                <Formulario categorias={categorias} onCreated={handlePlatoCreado} />

                <section className="mt-4 flex flex-wrap gap-2">
                    {categorias &&
                        categorias.map((categoria) => (
                            <Badge
                                key={categoria.id}
                                variant="outline"
                                className={`cursor-pointer ${
                                    categoriaSeleccionada.some((cat: Categoria) => cat.id === categoria.id) ? 'bg-gray-500 text-white' : ''
                                }`}
                                onClick={() => handleClickCategoria(categoria.id)}
                            >
                                {categoria.nombre}
                            </Badge>
                        ))}
                </section>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {listaPlatos.length === 0 && (
                        <div className="col-span-3 rounded-md bg-gray-100 p-4 text-center shadow-md">
                            <p className="text-gray-600">No hay platos disponibles.</p>
                        </div>
                    )}
                    {listaPlatos.map((plato) => (
                        <div key={plato.id} className="rounded-md border p-4 shadow-md">
                            {plato.imagen && (
                                <img src={plato.imagen} alt={plato.nombre} className="mb-2 h-32 w-full rounded-md object-cover" />
                            )}
                            <div className="mb-2 flex items-start justify-between">
                                <h2 className="text-lg font-semibold">{plato.nombre}</h2>
                                <div className="flex flex-col gap-1 items-end">
                                    <Badge variant={plato.activo ? 'default' : 'secondary'} className="text-xs">
                                        {plato.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                    <Badge
                                        variant={plato.disponible ? 'outline' : 'destructive'}
                                        className="text-xs"
                                    >
                                        {plato.disponible ? 'Disponible' : 'Agotado'}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{plato.descripcion}</p>
                            <p className="mt-1 font-bold text-gray-800">${plato.precio}</p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={plato.activo ? 'outline' : 'default'}
                                    onClick={() => toggleActivo(plato.id)}
                                >
                                    {plato.activo ? 'Desactivar' : 'Activar'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant={plato.disponible ? 'outline' : 'default'}
                                    onClick={() => toggleDisponible(plato.id)}
                                >
                                    {plato.disponible ? 'Marcar Agotado' : 'Marcar Disponible'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setOpcionesPlato(opcionesPlato === plato.id ? null : plato.id)}
                                >
                                    Opciones ({(plato.opciones || []).length})
                                </Button>
                            </div>

                            {/* Panel de opciones/variantes */}
                            {opcionesPlato === plato.id && (
                                <div className="mt-3 rounded-md bg-gray-50 p-3">
                                    <h3 className="mb-2 text-sm font-semibold">Variantes / Opciones</h3>
                                    {(plato.opciones || []).length === 0 && (
                                        <p className="text-xs text-gray-500">Sin opciones aún.</p>
                                    )}
                                    <ul className="mb-2 space-y-1">
                                        {(plato.opciones || []).map((opcion: Opcion) => (
                                            <li key={opcion.id} className="flex items-center justify-between text-sm">
                                                <span>
                                                    {opcion.nombre}
                                                    {opcion.precio_extra > 0 && (
                                                        <span className="ml-1 text-green-600">(+${opcion.precio_extra})</span>
                                                    )}
                                                </span>
                                                <button
                                                    className="text-red-400 hover:text-red-600"
                                                    onClick={() => eliminarOpcion(plato.id, opcion.id)}
                                                >
                                                    ✕
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 rounded border px-2 py-1 text-sm"
                                            placeholder="Nombre (ej: Con queso)"
                                            value={nuevaOpcion.nombre}
                                            onChange={(e) => setNuevaOpcion((prev) => ({ ...prev, nombre: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            className="w-24 rounded border px-2 py-1 text-sm"
                                            placeholder="Precio extra"
                                            value={nuevaOpcion.precio_extra}
                                            min={0}
                                            onChange={(e) =>
                                                setNuevaOpcion((prev) => ({ ...prev, precio_extra: parseFloat(e.target.value) || 0 }))
                                            }
                                        />
                                        <Button size="sm" onClick={() => agregarOpcion(plato.id)}>
                                            +
                                        </Button>
                                    </div>
                                    {opcionError && <p className="mt-1 text-xs text-red-500">{opcionError}</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
