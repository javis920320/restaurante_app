import { Button } from '@/components/ui/button';
import { usePedido } from '@/hooks/usePedido';
import { Pedido } from '@/services/pedidoService';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, ChefHat, Clock, CreditCard, Loader2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PedidoStatusProps {
    codigo: string;
    pedidoInicial?: Pedido;
}

const estadosConfig = {
    pendiente: {
        label: 'Pendiente',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Tu pedido ha sido recibido y está en espera de confirmación',
    },
    confirmado: {
        label: 'Confirmado',
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Tu pedido ha sido confirmado y será preparado pronto',
    },
    en_preparacion: {
        label: 'En Preparación',
        icon: ChefHat,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: 'Tu pedido está siendo preparado en la cocina',
    },
    listo: {
        label: 'Listo',
        icon: Package,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: '¡Tu pedido está listo! Un mesero te lo llevará pronto',
        notify: true,
    },
    entregado: {
        label: 'Entregado',
        icon: CheckCircle,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        description: 'Tu pedido ha sido entregado. ¡Buen provecho!',
    },
    pagado: {
        label: 'Pagado',
        icon: CreditCard,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Pedido pagado. ¡Gracias por tu visita!',
    },
    cancelado: {
        label: 'Cancelado',
        icon: Clock,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Este pedido ha sido cancelado',
    },
};

export default function Status({ codigo, pedidoInicial }: PedidoStatusProps) {
    const { pedido: pedidoActualizado, loading, error } = usePedido(codigo);
    const [pedido, setPedido] = useState<Pedido | null>(pedidoInicial || null);

    // Update pedido when we get new data from polling
    useEffect(() => {
        if (pedidoActualizado) {
            setPedido(pedidoActualizado);
        }
    }, [pedidoActualizado]);

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

    // Mostrar notificación cuando el pedido esté listo
    useEffect(() => {
        if (pedido && pedido.estado === 'listo') {
            // Aquí se podría agregar una notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('¡Tu pedido está listo!', {
                    body: 'Un mesero te lo llevará pronto',
                    icon: '/favicon.ico',
                });
            }
        }
    }, [pedido?.estado]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading && !pedido) {
        return (
            <>
                <Head title="Cargando pedido..." />
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Cargando tu pedido...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head title="Error" />
                <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                        <p className="mb-4 text-red-600">{error}</p>
                        <Button onClick={() => router.visit('/')}>Volver al inicio</Button>
                    </div>
                </div>
            </>
        );
    }

    if (!pedido) {
        return null;
    }

    const estadoConfig = estadosConfig[pedido.estado as keyof typeof estadosConfig] || estadosConfig.pendiente;
    const IconComponent = estadoConfig.icon;

    return (
        <>
            <Head title={`Pedido - ${estadoConfig.label}`} />

            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Estado actual destacado */}
                    <div className={`${estadoConfig.bgColor} ${estadoConfig.borderColor} mb-6 rounded-xl border-2 p-6 shadow-lg`}>
                        <div className="mb-4 flex items-center gap-4">
                            <div className={`${estadoConfig.color} rounded-full bg-white p-3`}>
                                <IconComponent className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h1 className={`text-2xl font-bold ${estadoConfig.color}`}>{estadoConfig.label}</h1>
                                <p className="mt-1 text-sm text-gray-600">{estadoConfig.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Información del pedido */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Información del Pedido</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Mesa:</span>
                                <span className="font-medium">{pedido.mesa?.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha:</span>
                                <span className="font-medium">{formatDate(pedido.created_at)}</span>
                            </div>
                            {pedido.notas && (
                                <div>
                                    <span className="text-gray-600">Notas:</span>
                                    <p className="mt-1 text-gray-900">{pedido.notas}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles del pedido */}
                    {pedido.detalles && pedido.detalles.length > 0 && (
                        <div className="mb-6 rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Productos</h2>

                            <div className="space-y-3">
                                {pedido.detalles.map((detalle) => (
                                    <div
                                        key={detalle.id}
                                        className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{detalle.producto.nombre}</p>
                                            <p className="text-sm text-gray-600">
                                                {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                                            </p>
                                            {detalle.notas && <p className="mt-1 text-xs text-gray-500 italic">{detalle.notas}</p>}
                                        </div>
                                        <span className="font-semibold text-gray-900">{formatPrice(detalle.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t-2 border-gray-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatPrice(pedido.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline de estados */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Seguimiento</h2>

                        <div className="relative">
                            {Object.entries(estadosConfig)
                                .slice(0, 6)
                                .map(([key, config], index, array) => {
                                    const isActive = pedido.estado === key;
                                    const estadoIndex = Object.keys(estadosConfig).indexOf(pedido.estado);
                                    const currentIndex = Object.keys(estadosConfig).indexOf(key);
                                    const isCompleted = currentIndex <= estadoIndex;

                                    return (
                                        <div key={key} className="flex gap-4 pb-6 last:pb-0">
                                            <div className="relative flex flex-col items-center">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                        isCompleted ? config.bgColor + ' ' + config.color : 'bg-gray-100 text-gray-400'
                                                    } border-2 ${isActive ? config.borderColor : 'border-gray-200'}`}
                                                >
                                                    {isCompleted && <CheckCircle className="h-5 w-5" />}
                                                </div>
                                                {index < array.length - 1 && (
                                                    <div className={`absolute top-8 h-full w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <p className={`font-medium ${isActive ? config.color : 'text-gray-900'}`}>{config.label}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Actualización automática */}
                    <p className="mt-6 text-center text-sm text-gray-500">Esta página se actualiza automáticamente cada 10 segundos</p>
                </div>
            </div>
        </>
    );
}
