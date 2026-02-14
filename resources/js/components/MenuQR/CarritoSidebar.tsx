import { Button } from '@/components/ui/button';
import { useCarrito } from '@/context/CarritoContext';
import pedidoService from '@/services/pedidoService';
import { router } from '@inertiajs/react';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import CarritoItem from './CarritoItem';

interface CarritoSidebarProps {
    qrToken: string;
    showAsModal?: boolean;
    onClose?: () => void;
}

export default function CarritoSidebar({ qrToken, showAsModal = false, onClose }: CarritoSidebarProps) {
    const { state, limpiarCarrito, cantidadTotal } = useCarrito();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmacion, setShowConfirmacion] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleConfirmarPedido = async () => {
        if (state.items.length === 0) return;

        try {
            setLoading(true);
            setError(null);

            // Preparar items para enviar al backend
            const items = state.items.map((item) => ({
                producto_id: item.producto.id,
                cantidad: item.cantidad,
                notas: item.notas,
            }));

            // Crear pedido
            const response = await pedidoService.crearPedido({
                qr_token: qrToken,
                items,
            });

            // Limpiar carrito
            limpiarCarrito();

            // Redirigir a la página de estado del pedido usando el ID
            router.visit(`/pedido/${response.pedido.id}`);
        } catch (err) {
            console.error('Error al crear pedido:', err);
            const errorMessage = (err as Error).message || 'Error al crear el pedido. Por favor, intenta de nuevo.';
            setError(errorMessage);
        } finally {
            setLoading(false);
            setShowConfirmacion(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Tu Pedido</h2>
                        {cantidadTotal > 0 && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">{cantidadTotal}</span>
                        )}
                    </div>

                    {showAsModal && onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4">
                {state.items.length === 0 ? (
                    <div className="py-12 text-center">
                        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-gray-500">Tu carrito está vacío</p>
                        <p className="mt-2 text-sm text-gray-400">Agrega productos del menú para comenzar</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {state.items.map((item) => (
                            <CarritoItem key={item.producto.id} item={item} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>

            {/* Footer con total y botón */}
            {state.items.length > 0 && (
                <div className="space-y-4 border-t border-gray-200 p-4">
                    {/* Total */}
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total (estimado):</span>
                        <span className="text-2xl font-bold text-green-600">{formatPrice(state.total)}</span>
                    </div>

                    <p className="text-center text-xs text-gray-500">El total final será calculado por el sistema</p>

                    {/* Modal de confirmación */}
                    {showConfirmacion ? (
                        <div className="space-y-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm font-medium text-gray-700">¿Confirmar pedido?</p>
                            <p className="text-xs text-gray-600">Se enviará tu pedido a la cocina con {cantidadTotal} producto(s)</p>
                            <div className="flex gap-2">
                                <Button onClick={handleConfirmarPedido} disabled={loading} className="flex-1">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Sí, confirmar'
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setShowConfirmacion(false)} disabled={loading} className="flex-1">
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button onClick={() => setShowConfirmacion(true)} disabled={loading} size="lg" className="w-full text-lg font-semibold">
                            Confirmar Pedido
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
