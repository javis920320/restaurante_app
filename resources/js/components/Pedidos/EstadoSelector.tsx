import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Loader2 } from 'lucide-react';

interface EstadoSelectorProps {
    estadoActual: string;
    pedidoId: number;
    onCambiarEstado: (pedidoId: number, nuevoEstado: string) => Promise<void>;
    disabled?: boolean;
}

const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'en_preparacion', label: 'En Preparación' },
    { value: 'listo', label: 'Listo' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'pagado', label: 'Pagado' },
    { value: 'cancelado', label: 'Cancelado' },
];

export default function EstadoSelector({ estadoActual, pedidoId, onCambiarEstado, disabled }: EstadoSelectorProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = async (nuevoEstado: string) => {
        if (nuevoEstado === estadoActual) return;

        setLoading(true);
        setError(null);

        try {
            await onCambiarEstado(pedidoId, nuevoEstado);
        } catch (err: any) {
            setError(err.message || 'Error al cambiar el estado');
            console.error('Error cambiando estado:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Select
                value={estadoActual}
                onValueChange={handleChange}
                disabled={disabled || loading}
            >
                <SelectTrigger className="w-full">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Actualizando...</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="Seleccionar estado" />
                    )}
                </SelectTrigger>
                <SelectContent>
                    {estadosDisponibles.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
