import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Mesa } from '@/types';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';
import { Table, Users, Store, Check, RefreshCw, Layers } from 'lucide-react';

interface Restaurante {
    id: number;
    nombre: string;
}

interface FormularioMesaProps {
    restaurantes: Restaurante[];
    mesa?: Mesa | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FormularioMesa({ restaurantes, mesa, onSuccess, onCancel }: FormularioMesaProps) {
    const isEdit = !!mesa;

    const { data, setData, errors, setError, processing, reset } = useForm({
        nombre: '',
        capacidad: 4,
        restaurante_id: restaurantes[0]?.id?.toString() || '',
        estado: 'disponible' as 'disponible' | 'ocupada',
        activa: true as boolean,
    });

    // Sync or reset form when the table changes
    React.useEffect(() => {
        if (mesa) {
            setData({
                nombre: mesa.nombre,
                capacidad: mesa.capacidad,
                restaurante_id: mesa.restaurante_id?.toString() || '',
                estado: (mesa.estado || 'disponible') as 'disponible' | 'ocupada',
                activa: mesa.activa,
            });
        } else {
            reset();
        }
    }, [mesa]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEdit ? route('mesas.update', mesa.id) : route('mesas.store');
            const payload = {
                nombre: data.nombre,
                capacidad: data.capacidad,
                restaurante_id: parseInt(data.restaurante_id),
                estado: data.estado,
                activa: data.activa,
            };

            const respuesta = isEdit
                ? await axios.put(url, payload)
                : await axios.post(url, payload);

            if (respuesta.status === 200 || respuesta.status === 201) {
                if (!isEdit) reset();
                onSuccess?.();
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const backendErrors = error.response.data.errors as Record<string, string[]>;
                Object.keys(backendErrors).forEach((key: string) => {
                    setError(key as any, backendErrors[key][0]);
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Nombre de la Mesa */}
                <div className="space-y-1">
                    <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Nombre de la Mesa
                    </Label>
                    <div className="relative">
                        <Table className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            id="nombre"
                            className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                            placeholder="Ej: Mesa 1, Mesa de Terraza A..."
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.nombre} />
                </div>

                {/* Fila: Capacidad y Restaurante */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Capacidad */}
                    <div className="space-y-1">
                        <Label htmlFor="capacidad" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Capacidad (Personas)
                        </Label>
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                            <Input
                                id="capacidad"
                                type="number"
                                className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                                placeholder="4"
                                value={data.capacidad || ''}
                                min={1}
                                max={50}
                                onChange={(e) => setData('capacidad', parseInt(e.target.value) || 1)}
                                required
                            />
                        </div>
                        <InputError message={errors.capacidad} />
                    </div>

                    {/* Restaurante */}
                    <div className="space-y-1">
                        <Label htmlFor="restaurante_id" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Restaurante
                        </Label>
                        {restaurantes.length === 0 ? (
                            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-200/50">
                                No hay locales activos.
                            </div>
                        ) : (
                            <Select
                                value={data.restaurante_id}
                                onValueChange={(value) => setData('restaurante_id', value)}
                            >
                                <SelectTrigger id="restaurante_id" className="h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl">
                                    <SelectValue placeholder="Selecciona local" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {restaurantes.map((r) => (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            {r.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <InputError message={errors.restaurante_id} />
                    </div>
                </div>

                {/* Estado Inicial */}
                <div className="space-y-1">
                    <Label htmlFor="estado" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Estado
                    </Label>
                    <Select
                        value={data.estado}
                        onValueChange={(value) => setData('estado', value as 'disponible' | 'ocupada')}
                    >
                        <SelectTrigger id="estado" className="h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl">
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="disponible">Libre (Disponible)</SelectItem>
                            <SelectItem value="ocupada">Ocupada</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.estado} />
                </div>

                {/* Mesa Activa */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <input
                        type="checkbox"
                        id="activa"
                        checked={data.activa}
                        onChange={(e) => setData('activa', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Label htmlFor="activa" className="text-sm text-slate-700 dark:text-slate-350 cursor-pointer font-medium select-none">
                        Habilitar Mesa (Mesa Activa)
                    </Label>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={processing}
                        className="rounded-xl px-4"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={processing || restaurantes.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 shadow-sm shadow-indigo-100"
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Guardando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            {isEdit ? 'Actualizar Mesa' : 'Guardar Mesa'}
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}
