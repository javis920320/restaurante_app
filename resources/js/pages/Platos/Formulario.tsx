import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';

interface FormularioProps {
    categorias: { id: number; nombre: string }[];
    onCreated?: () => void;
}

const PRODUCTION_AREA_OPTIONS = [
    { value: 'none', label: 'Sin área (entrega directa)' },
    { value: 'kitchen', label: '🍳 Cocina' },
    { value: 'bar', label: '🍹 Bar' },
];

export default function Formulario({ categorias, onCreated }: FormularioProps) {
    const { data, setData, errors, setError, processing, reset } = useForm({
        nombre: '',
        precio: 0,
        descripcion: '',
        categoria_id: 0,
        imagen: '',
        disponible: true,
        production_area: 'none' as 'none' | 'kitchen' | 'bar',
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const respuesta = await axios.post(route('platos.store'), {
                nombre: data.nombre,
                precio: data.precio,
                descripcion: data.descripcion,
                categoria_id: data.categoria_id,
                imagen: data.imagen.trim() || null,
                disponible: data.disponible,
                production_area: data.production_area,
            });

            if (respuesta.status === 200 || respuesta.status === 201) {
                reset();
                onCreated?.();
            }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const errorResponse = error as {
                    response?: { data?: { errors?: Record<string, string[]> } };
                };
                const backendErrors = errorResponse.response?.data?.errors;
                if (backendErrors) {
                    Object.keys(backendErrors).forEach((key: string) => {
                        setError(key, backendErrors[key][0]);
                    });
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-md border p-4">
            <h2 className="mb-3 text-lg font-semibold">Nuevo Plato</h2>
            <InputError message={errors.nombre} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Input
                    className="col-span-2"
                    placeholder="Nombre del plato"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="Precio del plato"
                    value={data.precio}
                    min={0}
                    onChange={(e) => setData('precio', parseFloat(e.target.value))}
                />
            </div>
            <Select onValueChange={(value) => setData('categoria_id', parseInt(value))}>
                <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Selecciona una categoria" />
                    <SelectContent>
                        {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                {categoria.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectTrigger>
            </Select>

            <div className="mt-2">
                <Select
                    defaultValue="none"
                    onValueChange={(value) => setData('production_area', value as 'none' | 'kitchen' | 'bar')}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Área de producción" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRODUCTION_AREA_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.production_area} />
            </div>

            <div className="my-2">
                <textarea
                    className="w-full rounded-2xl border p-2"
                    placeholder="Descripción del plato"
                    value={data.descripcion}
                    onChange={(e) => setData('descripcion', e.target.value)}
                />
            </div>

            <div className="mb-2">
                <Input
                    placeholder="URL de imagen (opcional)"
                    value={data.imagen}
                    onChange={(e) => setData('imagen', e.target.value)}
                />
            </div>

            <div className="mb-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    id="disponible"
                    checked={data.disponible}
                    onChange={(e) => setData('disponible', e.target.checked)}
                    className="h-4 w-4"
                />
                <label htmlFor="disponible" className="text-sm text-gray-700">
                    Disponible al crear
                </label>
            </div>

            <Button type="submit" disabled={processing} className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white">
                Guardar Plato
            </Button>
        </form>
    );
}

