import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';

export default function Formulario({ categorias }: { categorias: { id: number; nombre: string }[] }) {
    const { data, setData, errors, setError, processing } = useForm({
        nombre: '',
        precio: 0,
        descripcion: '',
        categoria_id: 0,
        imagen: null,
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const respuesta = await axios.post(route('platos.store'), {
                nombre: data.nombre,
                precio: data.precio,
                descripcion: data.descripcion,
                categoria_id: data.categoria_id,
                imagen: data.imagen,
            });

            if (respuesta.status === 200) {
                setData({ nombre: '', precio: 0, descripcion: '', categoria_id: 0, imagen: null });
            } else {
                // Maneja el error aquí
            }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const errorResponse = error as {
                    response?: { data?: { errors?: Record<string, string[]> } };
                };
                const backendErrors = errorResponse.response?.data?.errors;
                if (backendErrors) {
                    Object.keys(backendErrors).forEach((key: string) => {
                        setError(key, backendErrors[key][0]); // Establece el error en el campo correspondiente
                    });
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <InputError message={errors.nombre} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Input
                    className="col-span-2"
                    placeholder="Nombre del plato"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                ></Input>
                <Input
                    type="number"
                    placeholder="Precio del plato"
                    value={data.precio}
                    onChange={(e) => setData('precio', parseFloat(e.target.value))}
                ></Input>
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

            <div className="my-2">
                <textarea
                    className="w-full rounded-2xl border-1 p-2"
                    placeholder="Descripción del plato"
                    value={data.descripcion}
                    onChange={(e) => setData('descripcion', e.target.value)}
                ></textarea>
            </div>
            <Button
                type="submit"
                disabled={processing}
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
            >
                Nuevo Plato
            </Button>
        </form>
    );
}

