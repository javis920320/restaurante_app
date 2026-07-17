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
    {
        key: 'pendiente',
        label: 'Pendiente',
        color: 'bg-slate-50/70 border-slate-200 text-slate-700 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-350',
        dot: 'bg-slate-400',
    },
    {
        key: 'confirmado',
        label: 'Confirmado',
        color: 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-950/15 dark:border-blue-900/30 dark:text-blue-300',
        dot: 'bg-blue-500',
    },
    {
        key: 'en_preparacion',
        label: 'En Preparación',
        color: 'bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-950/15 dark:border-amber-900/30 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    {
        key: 'listo',
        label: 'Listo',
        color: 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/15 dark:border-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    {
        key: 'entregado',
        label: 'Entregado',
        color: 'bg-blue-50/20 border-blue-200 text-blue-700 dark:bg-blue-950/5 dark:border-blue-900/20 dark:text-blue-400',
        dot: 'bg-blue-450',
    },
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
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
                        <Skeleton className="h-48 w-full rounded-2xl" />
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
                    <div key={estado.key} className="flex flex-col space-y-4">
                        <div className={`flex items-center justify-between rounded-2xl border p-3 shadow-sm ${estado.color}`}>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`h-2 w-2 rounded-full ${estado.dot}`} />
                                    <h3 className="text-sm font-extrabold tracking-tight">{estado.label}</h3>
                                </div>
                                <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {pedidosEstado.length} pedido(s)
                                </p>
                            </div>
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
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center dark:border-slate-800 dark:bg-slate-950/20">
                                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Sin pedidos</p>
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
    const isDelayed = pedido.tiempo_transcurrido > 30 && pedido.estado !== 'entregado' && pedido.estado !== 'listo';

    const estadoLabels: Record<string, string> = {
        confirmado: 'Confirmado',
        en_preparacion: 'En Preparación',
        listo: 'Listo',
        entregado: 'Entregado',
        pagado: 'Pagado',
        cancelado: 'Cancelado',
    };

    return (
        <Card
            className={`rounded-3xl border-slate-200 bg-white transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 ${
                isDelayed ? 'border-red-300 bg-red-50/60 shadow-sm shadow-red-500/5 dark:border-red-900/30 dark:bg-red-950/10' : ''
            }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-slate-850 text-base font-extrabold dark:text-slate-100">Pedido #{pedido.codigo}</CardTitle>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Mesa: <span className="font-bold text-slate-700 dark:text-slate-300">{pedido.mesa.nombre}</span>
                        </p>
                    </div>
                    {isDelayed && <AlertTriangle className="h-4.5 w-4.5 animate-pulse text-red-500" aria-label="Pedido demorado" />}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Time and total */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Clock className={`h-3.5 w-3.5 ${isDelayed ? 'animate-pulse text-red-500' : 'text-slate-400'}`} />
                        <span>{pedido.tiempo_transcurrido}m</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                        ${pedido.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Products summary */}
                <div className="dark:border-slate-850 space-y-1.5 rounded-2xl border border-slate-100/60 bg-slate-50/50 p-3 dark:bg-slate-900/40">
                    <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">Productos</p>
                    <div className="space-y-1">
                        {pedido.productos_resumen.slice(0, 3).map((producto, idx) => (
                            <p key={idx} className="text-slate-650 flex items-center justify-between text-xs font-semibold dark:text-slate-300">
                                <span className="truncate">{producto.nombre}</span>
                                <span className="ml-1 shrink-0 rounded-md bg-slate-100/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    x{producto.cantidad}
                                </span>
                            </p>
                        ))}
                        {pedido.productos_resumen.length > 3 && (
                            <p className="pt-0.5 text-[10px] font-bold text-slate-400 italic dark:text-slate-500">
                                + {pedido.productos_resumen.length - 3} más...
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    {availableTransitions.length > 0 && (
                        <Select onValueChange={(value) => onCambiarEstado(pedido.id, value)} disabled={isUpdating}>
                            <SelectTrigger className="h-9 rounded-xl border-slate-200 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
                                <SelectValue placeholder="Cambiar estado" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {availableTransitions.map((estado) => (
                                    <SelectItem key={estado} value={estado} className="rounded-lg text-xs font-medium">
                                        {estadoLabels[estado] || estado}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full gap-1 rounded-xl border-slate-200 text-xs font-bold hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-900/80"
                        onClick={() => (window.location.href = `/pedidos/${pedido.id}`)}
                    >
                        <Eye className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        Ver detalle
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
