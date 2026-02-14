import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import { useState } from 'react';

interface ProductoResumen {
    nombre: string;
    cantidad: number;
}

interface PedidoKanban {
    id: number;
    codigo: number;
    mesa: {
        id: number;
        nombre: string;
    };
    estado: string;
    total: number;
    created_at: string;
    tiempo_transcurrido: number;
    productos_resumen: ProductoResumen[];
}

interface KanbanBoardProps {
    pedidos: {
        pendiente: PedidoKanban[];
        confirmado: PedidoKanban[];
        en_preparacion: PedidoKanban[];
        listo: PedidoKanban[];
        entregado: PedidoKanban[];
    };
    loading: boolean;
    onCambiarEstado: (pedidoId: number, nuevoEstado: string) => Promise<void>;
}

const ESTADOS = [
    { key: 'pendiente', label: 'Pendiente', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'confirmado', label: 'Confirmado', color: 'bg-blue-50 border-blue-200' },
    { key: 'en_preparacion', label: 'En Preparación', color: 'bg-orange-50 border-orange-200' },
    { key: 'listo', label: 'Listo', color: 'bg-green-50 border-green-200' },
    { key: 'entregado', label: 'Entregado', color: 'bg-gray-50 border-gray-200' },
];

const TRANSITIONS: Record<string, string[]> = {
    pendiente: ['confirmado', 'cancelado'],
    confirmado: ['en_preparacion', 'cancelado'],
    en_preparacion: ['listo', 'cancelado'],
    listo: ['entregado'],
    entregado: ['pagado'],
};

export function KanbanBoard({ pedidos, loading, onCambiarEstado }: KanbanBoardProps) {
    const [updatingPedido, setUpdatingPedido] = useState<number | null>(null);

    const handleEstadoChange = async (pedidoId: number, nuevoEstado: string) => {
        setUpdatingPedido(pedidoId);
        try {
            await onCambiarEstado(pedidoId, nuevoEstado);
        } catch (error) {
            console.error('Error changing state:', error);
        } finally {
            setUpdatingPedido(null);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {ESTADOS.map((estado) => (
                    <div key={estado.key} className="space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {ESTADOS.map((estado) => {
                const pedidosEstado = pedidos[estado.key as keyof typeof pedidos] || [];

                return (
                    <div key={estado.key} className="flex flex-col">
                        <div className={`mb-3 rounded-lg border p-3 ${estado.color}`}>
                            <h3 className="font-semibold text-gray-900">{estado.label}</h3>
                            <p className="text-sm text-gray-600">{pedidosEstado.length} pedido(s)</p>
                        </div>

                        <div className="space-y-3">
                            {pedidosEstado.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onCambiarEstado={handleEstadoChange}
                                    isUpdating={updatingPedido === pedido.id}
                                    availableTransitions={TRANSITIONS[pedido.estado] || []}
                                />
                            ))}

                            {pedidosEstado.length === 0 && (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                    <p className="text-sm text-gray-500">Sin pedidos</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface PedidoCardProps {
    pedido: PedidoKanban;
    onCambiarEstado: (pedidoId: number, nuevoEstado: string) => void;
    isUpdating: boolean;
    availableTransitions: string[];
}

function PedidoCard({ pedido, onCambiarEstado, isUpdating, availableTransitions }: PedidoCardProps) {
    const isDelayed = pedido.tiempo_transcurrido > 30; // More than 30 minutes

    const estadoLabels: Record<string, string> = {
        confirmado: 'Confirmado',
        en_preparacion: 'En Preparación',
        listo: 'Listo',
        entregado: 'Entregado',
        pagado: 'Pagado',
        cancelado: 'Cancelado',
    };

    return (
        <Card className={`${isDelayed ? 'border-red-300 bg-red-50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">Pedido #{pedido.codigo}</CardTitle>
                        <p className="text-sm text-gray-600">Mesa: {pedido.mesa.nombre}</p>
                    </div>
                    {isDelayed && (
                        <AlertTriangle className="h-5 w-5 text-red-600" title="Pedido demorado" />
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Time and total */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{pedido.tiempo_transcurrido} min</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                        ${pedido.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Products summary */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Productos:</p>
                    {pedido.productos_resumen.slice(0, 3).map((producto, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                            {producto.cantidad}x {producto.nombre}
                        </p>
                    ))}
                    {pedido.productos_resumen.length > 3 && (
                        <p className="text-xs text-gray-500">+ {pedido.productos_resumen.length - 3} más...</p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    {availableTransitions.length > 0 && (
                        <Select
                            onValueChange={(value) => onCambiarEstado(pedido.id, value)}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Cambiar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTransitions.map((estado) => (
                                    <SelectItem key={estado} value={estado}>
                                        {estadoLabels[estado] || estado}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-full text-xs"
                        onClick={() => (window.location.href = `/pedidos/${pedido.id}`)}
                    >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver detalle
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
