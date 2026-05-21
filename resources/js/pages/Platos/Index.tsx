import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Categoria, type Opcion, type Plato } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import Formulario from './Formulario';

export default function Index({ categorias, platos }: { categorias: { id: number; nombre: string }[]; platos: { data: Plato[] } | Plato[] }) {
    const platosArray: Plato[] = Array.isArray(platos) ? platos : (platos as { data: Plato[] }).data;
    const [listaPlatos, setListaPlatos] = React.useState<Plato[]>(platosArray);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<Array<{ id: number; nombre: string }>>([]);

    // Opciones management state
    const [opcionesPlato, setOpcionesPlato] = useState<number | null>(null);
    const [nuevaOpcion, setNuevaOpcion] = useState({ nombre: '', precio_extra: 0 });
    const [opcionError, setOpcionError] = useState<string | null>(null);

    const handleClickCategoria = (categoriaId: number) => {
        setCategoriaSeleccionada((prevCategorias) => {
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
        } catch (error: unknown) {
            let msg = 'Error al agregar opción.';
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data as any;
                if (responseData?.errors) {
                    msg = Object.values(responseData.errors as Record<string, string[]>).flat().join(' ');
                } else if (responseData?.message) {
                    msg = responseData.message;
                }
            } else {
                console.error(error);
            }
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

    const [query, setQuery] = useState('');

    const displayedPlatos = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return listaPlatos
            .filter((p) => {
                if (!q) return true;
                return (
                    p.nombre.toLowerCase().includes(q) ||
                    (p.descripcion || '').toLowerCase().includes(q)
                );
            })
            .sort((a, b) => Number(b.activo) - Number(a.activo));
    }, [listaPlatos, query]);

    return (
        <AppLayout>
            <Head title="Platos" />
            <ConfiguracionLayout>
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Platos</h1>
                        <p className="text-sm text-gray-500">Administra el catálogo de productos y sus variantes</p>
                    </div>
                    <div className="w-full md:w-1/3">
                        <Input
                            placeholder="Buscar platos por nombre o descripción..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    <div className="col-span-1">
                        <Formulario categorias={categorias} onCreated={handlePlatoCreado} />
                    </div>

                    <div className="col-span-2">
                        <section className="mt-2 flex flex-wrap gap-2">
                    {categorias &&
                        categorias.map((categoria) => (
                            <Badge
                                key={categoria.id}
                                variant="outline"
                                className={`cursor-pointer ${
                                    categoriaSeleccionada.some((cat) => cat.id === categoria.id) ? 'bg-gray-500 text-white' : ''
                                }`}
                                onClick={() => handleClickCategoria(categoria.id)}
                            >
                                {categoria.nombre}
                            </Badge>
                        ))}
                        </section>

                        <div className="mt-4">
                            {displayedPlatos.length === 0 ? (
                                <div className="rounded-md bg-gray-50 p-6 text-center shadow">
                                    <p className="text-gray-600">No se encontraron platos que coincidan.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {displayedPlatos.map((plato) => (
                                        <article key={plato.id} className="flex flex-col sm:flex-row items-start rounded-xl border p-4 shadow-sm hover:shadow-md transition">
                                            <div className="flex items-start gap-4 w-full">
                                                <div className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                    {plato.imagen ? (
                                                        <img src={plato.imagen} alt={plato.nombre} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">Sin imagen</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold">{plato.nombre}</h3>
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{plato.descripcion}</p>
                                                    <div className="mt-3 flex items-center justify-between w-full">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge variant={plato.activo ? 'default' : 'outline'} className="text-xs">
                                                                {plato.activo ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                            <Badge variant={plato.disponible ? 'secondary' : 'destructive'} className="text-xs">
                                                                {plato.disponible ? 'Disponible' : 'Agotado'}
                                                            </Badge>
                                                            <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                                <DollarSign className="h-3 w-3 text-gray-600" />
                                                                ${(Number(plato.precio) || 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                                            <Button variant="ghost" size="sm" onClick={() => setOpcionesPlato(opcionesPlato === plato.id ? null : plato.id)}>
                                                                Opciones ({(plato.opciones || []).length})
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => toggleActivo(plato.id)}>
                                                                {plato.activo ? 'Desactivar' : 'Activar'}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => toggleDisponible(plato.id)}>
                                                                {plato.disponible ? 'Marcar Agotado' : 'Marcar Disponible'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {opcionesPlato === plato.id && (
                                                <div className="mt-3 rounded-md bg-gray-50 p-3">
                                                    <h4 className="mb-2 text-sm font-semibold">Variantes / Opciones</h4>
                                                    {(plato.opciones || []).length === 0 ? (
                                                        <p className="text-xs text-gray-500">Sin opciones aún.</p>
                                                    ) : (
                                                        <ul className="mb-2 space-y-1">
                                                            {(plato.opciones || []).map((opcion: Opcion) => (
                                                                <li key={opcion.id} className="flex items-center justify-between text-sm">
                                                                    <span>
                                                                        {opcion.nombre}
                                                                        {opcion.precio_extra > 0 && (
                                                                            <span className="ml-1 text-green-600">(+${(Number(opcion.precio_extra) || 0).toFixed(2)})</span>
                                                                        )}
                                                                    </span>
                                                                    <button className="text-red-400 hover:text-red-600" onClick={() => eliminarOpcion(plato.id, opcion.id)}>
                                                                        ✕
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input type="text" className="flex-1 rounded border px-2 py-1 text-sm" placeholder="Nombre (ej: Con queso)" value={nuevaOpcion.nombre} onChange={(e) => setNuevaOpcion((prev) => ({ ...prev, nombre: e.target.value }))} />
                                                        <input type="number" className="w-28 rounded border px-2 py-1 text-sm" placeholder="Precio extra" value={nuevaOpcion.precio_extra} min={0} onChange={(e) => setNuevaOpcion((prev) => ({ ...prev, precio_extra: parseFloat(e.target.value) || 0 }))} />
                                                        <Button size="sm" onClick={() => agregarOpcion(plato.id)}>Agregar</Button>
                                                    </div>
                                                    {opcionError && <p className="mt-1 text-xs text-red-500">{opcionError}</p>}
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
