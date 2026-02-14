import React from 'react';
import { Pedido } from '../../services/pedidoService';
import EstadoBadge from './EstadoBadge';
import EstadoSelector from './EstadoSelector';
import { Clock, MapPin, FileText } from 'lucide-react';

interface PedidoCardProps {
    pedido: Pedido;
    onCambiarEstado: (pedidoId: number, nuevoEstado: string) => Promise<void>;
    showEstadoSelector?: boolean;
}

export default function PedidoCard({ pedido, onCambiarEstado, showEstadoSelector = true }: PedidoCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Determine if estado can be changed (no pagado ni cancelado)
    const puedeEditarEstado = !['pagado', 'cancelado'].includes(pedido.estado);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                            {pedido.mesa?.nombre || `Mesa #${pedido.mesa_id}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(pedido.created_at)}</span>
                    </div>
                </div>
                
                <div>
                    <EstadoBadge estado={pedido.estado} />
                </div>
            </div>

            {/* Detalles del pedido */}
            {pedido.detalles && pedido.detalles.length > 0 && (
                <div className="mb-3 space-y-1">
                    {pedido.detalles.slice(0, 3).map((detalle) => (
                        <div key={detalle.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                                {detalle.cantidad}x {detalle.producto.nombre}
                            </span>
                            <span className="text-gray-600">
                                {formatPrice(detalle.subtotal)}
                            </span>
                        </div>
                    ))}
                    {pedido.detalles.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                            +{pedido.detalles.length - 3} producto(s) más
                        </p>
                    )}
                </div>
            )}

            {/* Notas */}
            {pedido.notas && (
                <div className="mb-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                        <FileText className="h-3 w-3 mt-0.5" />
                        <span className="italic">{pedido.notas}</span>
                    </div>
                </div>
            )}

            {/* Footer con total y selector de estado */}
            <div className="border-t border-gray-200 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                        {formatPrice(pedido.total)}
                    </span>
                </div>

                {showEstadoSelector && puedeEditarEstado && (
                    <EstadoSelector
                        estadoActual={pedido.estado}
                        pedidoId={pedido.id}
                        onCambiarEstado={onCambiarEstado}
                    />
                )}
            </div>
        </div>
    );
}
