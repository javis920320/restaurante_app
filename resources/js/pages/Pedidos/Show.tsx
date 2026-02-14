import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import EstadoSelector from '@/components/Pedidos/EstadoSelector';
import { Button } from '@/components/ui/button';
import { useAdminPedidos } from '@/hooks/useAdminPedidos';
import AppLayout from '@/layouts/app-layout';
import { Pedido } from '@/services/pedidoService';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, FileText, MapPin, User } from 'lucide-react';

interface ShowProps {
    pedido: Pedido;
}

export default function Show({ pedido: pedidoInicial }: ShowProps) {
    const { cambiarEstado } = useAdminPedidos();

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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        await cambiarEstado(pedidoId, nuevoEstado);
        // Reload the page to get updated data
        window.location.reload();
    };

    const puedeEditarEstado = !['pagado', 'cancelado'].includes(pedidoInicial.estado);

    return (
        <AppLayout>
            <Head title={`Pedido #${pedidoInicial.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/pedidos">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">Pedido #{pedidoInicial.id}</h1>
                    </div>
                    <EstadoBadge estado={pedidoInicial.estado} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Información principal */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Detalles del pedido */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Productos</h2>

                            {pedidoInicial.detalles && pedidoInicial.detalles.length > 0 ? (
                                <div className="space-y-4">
                                    {pedidoInicial.detalles.map((detalle) => (
                                        <div
                                            key={detalle.id}
                                            className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{detalle.producto.nombre}</h3>
                                                {detalle.producto.descripcion && (
                                                    <p className="mt-1 text-sm text-gray-600">{detalle.producto.descripcion}</p>
                                                )}
                                                <div className="mt-2 text-sm text-gray-600">
                                                    {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                                                </div>
                                                {detalle.notas && (
                                                    <div className="mt-2 text-sm">
                                                        <span className="text-gray-500 italic">Nota: {detalle.notas}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 text-right">
                                                <span className="font-semibold text-gray-900">{formatPrice(detalle.subtotal)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Totales */}
                                    <div className="space-y-2 border-t-2 border-gray-200 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">{formatPrice(pedidoInicial.subtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                                            <span className="text-2xl font-bold text-green-600">{formatPrice(pedidoInicial.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay productos en este pedido</p>
                            )}
                        </div>

                        {/* Notas del pedido */}
                        {pedidoInicial.notas && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 h-5 w-5 text-gray-500" />
                                    <div>
                                        <h2 className="mb-2 text-lg font-semibold text-gray-900">Notas del pedido</h2>
                                        <p className="text-gray-700">{pedidoInicial.notas}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar con información del pedido */}
                    <div className="space-y-6">
                        {/* Cambiar estado */}
                        {puedeEditarEstado && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Cambiar Estado</h2>
                                <EstadoSelector
                                    estadoActual={pedidoInicial.estado}
                                    pedidoId={pedidoInicial.id}
                                    onCambiarEstado={handleCambiarEstado}
                                />
                            </div>
                        )}

                        {/* Información de la mesa */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Información</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Mesa</p>
                                        <p className="font-medium text-gray-900">{pedidoInicial.mesa?.nombre || `Mesa #${pedidoInicial.mesa_id}`}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="mt-0.5 h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Fecha y hora</p>
                                        <p className="font-medium text-gray-900">{formatDate(pedidoInicial.created_at)}</p>
                                    </div>
                                </div>

                                {pedidoInicial.cliente && (
                                    <div className="flex items-start gap-3">
                                        <User className="mt-0.5 h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Cliente</p>
                                            <p className="font-medium text-gray-900">{pedidoInicial.cliente}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
