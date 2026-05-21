import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Plato } from '@/types';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';
import { Utensils, DollarSign, Image, Clipboard, Check, RefreshCw } from 'lucide-react';

interface FormularioProps {
    categorias: { id: number; nombre: string }[];
    plato?: Plato | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PRODUCTION_AREA_OPTIONS = [
    { value: 'none', label: 'Sin área (Entrega directa)' },
    { value: 'kitchen', label: 'Cocina 🍳' },
    { value: 'bar', label: 'Bar 🍹' },
];

export default function Formulario({ categorias, plato, onSuccess, onCancel }: FormularioProps) {
    const isEdit = !!plato;

    const { data, setData, errors, setError, processing, reset } = useForm({
        nombre: '',
        precio: 0,
        descripcion: '',
        categoria_id: 0,
        imagen: '',
        disponible: true as boolean,
        production_area: 'none' as 'none' | 'kitchen' | 'bar',
    });

    // Reset or populate form when plato changes
    React.useEffect(() => {
        if (plato) {
            setData({
                nombre: plato.nombre,
                precio: Number(plato.precio) || 0,
                descripcion: plato.descripcion || '',
                categoria_id: plato.categoria_id,
                imagen: plato.imagen || '',
                disponible: plato.disponible,
                production_area: plato.production_area || 'none',
            });
        } else {
            reset();
            if (categorias.length > 0) {
                // Pre-select first category in create mode if available
                setData('categoria_id', 0);
            }
        }
    }, [plato]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEdit ? route('platos.update', plato.id) : route('platos.store');
            const payload = {
                nombre: data.nombre,
                precio: data.precio,
                descripcion: data.descripcion,
                categoria_id: data.categoria_id,
                imagen: data.imagen.trim() || null,
                disponible: data.disponible,
                production_area: data.production_area,
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
                {/* Nombre */}
                <div className="space-y-1">
                    <Label htmlFor="nombre" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Nombre del Plato
                    </Label>
                    <div className="relative">
                        <Utensils className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            id="nombre"
                            className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                            placeholder="Ej: Lomo Saltado Premium"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.nombre} />
                </div>

                {/* Fila: Precio e Imagen url */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Precio */}
                    <div className="space-y-1">
                        <Label htmlFor="precio" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Precio ($)
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                            <Input
                                id="precio"
                                type="number"
                                step="0.01"
                                className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                                placeholder="0.00"
                                value={data.precio || ''}
                                min={0}
                                onChange={(e) => setData('precio', parseFloat(e.target.value) || 0)}
                                required
                            />
                        </div>
                        <InputError message={errors.precio} />
                    </div>

                    {/* Categoría */}
                    <div className="space-y-1">
                        <Label htmlFor="categoria" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Categoría
                        </Label>
                        <Select
                            value={data.categoria_id ? data.categoria_id.toString() : undefined}
                            onValueChange={(value) => setData('categoria_id', parseInt(value))}
                        >
                            <SelectTrigger id="categoria" className="h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl">
                                <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {categorias.map((categoria) => (
                                    <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                        {categoria.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.categoria_id} />
                    </div>
                </div>

                {/* Área de producción */}
                <div className="space-y-1">
                    <Label htmlFor="production_area" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Área de Producción (Preparación)
                    </Label>
                    <Select
                        value={data.production_area}
                        onValueChange={(value) => setData('production_area', value as 'none' | 'kitchen' | 'bar')}
                    >
                        <SelectTrigger id="production_area" className="h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl">
                            <SelectValue placeholder="Selecciona área de producción" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {PRODUCTION_AREA_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.production_area} />
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                    <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Descripción
                    </Label>
                    <div className="relative">
                        <Clipboard className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                        <textarea
                            id="descripcion"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[90px] text-sm"
                            placeholder="Escribe los ingredientes o detalles del plato..."
                            value={data.descripcion}
                            onChange={(e) => setData('descripcion', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.descripcion} />
                </div>

                {/* Imagen URL */}
                <div className="space-y-1">
                    <Label htmlFor="imagen" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        URL de la Imagen
                    </Label>
                    <div className="relative">
                        <Image className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            id="imagen"
                            className="pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                            placeholder="https://ejemplo.com/plato.jpg"
                            value={data.imagen}
                            onChange={(e) => setData('imagen', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.imagen} />

                    {/* Vista previa en tiempo real */}
                    {data.imagen.trim() && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="h-16 w-16 overflow-hidden rounded-lg border bg-white flex-shrink-0">
                                <img
                                    src={data.imagen}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vista previa</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                    {data.imagen}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Disponible */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <input
                        type="checkbox"
                        id="disponible"
                        checked={data.disponible}
                        onChange={(e) => setData('disponible', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <Label htmlFor="disponible" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium select-none">
                        Disponible de inmediato
                    </Label>
                </div>
            </div>

            {/* Acciones */}
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
                    disabled={processing}
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
                            {isEdit ? 'Actualizar Plato' : 'Guardar Plato'}
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}
