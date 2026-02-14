import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { usePedido } from '../../hooks/usePedido';
import { Pedido } from '../../services/pedidoService';
import { CheckCircle, Clock, ChefHat, Package, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

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
    }, [pedido?.estado]);

    if (loading && !pedido) {
        return (
            <>
                <Head title="Cargando pedido..." />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={() => router.visit('/')}>
                            Volver al inicio
                        </Button>
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
            
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Estado actual destacado */}
                    <div className={`${estadoConfig.bgColor} ${estadoConfig.borderColor} border-2 rounded-xl p-6 mb-6 shadow-lg`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`${estadoConfig.color} p-3 rounded-full bg-white`}>
                                <IconComponent className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <h1 className={`text-2xl font-bold ${estadoConfig.color}`}>
                                    {estadoConfig.label}
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {estadoConfig.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información del pedido */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Información del Pedido
                        </h2>
                        
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
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Productos
                            </h2>
                            
                            <div className="space-y-3">
                                {pedido.detalles.map((detalle) => (
                                    <div key={detalle.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {detalle.producto.nombre}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                                            </p>
                                            {detalle.notas && (
                                                <p className="text-xs text-gray-500 italic mt-1">
                                                    {detalle.notas}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {formatPrice(detalle.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-gray-200 mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">
                                        Total:
                                    </span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatPrice(pedido.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline de estados */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Seguimiento
                        </h2>
                        
                        <div className="relative">
                            {Object.entries(estadosConfig).slice(0, 6).map(([key, config], index, array) => {
                                const isActive = pedido.estado === key;
                                const estadoIndex = Object.keys(estadosConfig).indexOf(pedido.estado);
                                const currentIndex = Object.keys(estadosConfig).indexOf(key);
                                const isCompleted = currentIndex <= estadoIndex;
                                
                                return (
                                    <div key={key} className="flex gap-4 pb-6 last:pb-0">
                                        <div className="relative flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                isCompleted ? config.bgColor + ' ' + config.color : 'bg-gray-100 text-gray-400'
                                            } border-2 ${isActive ? config.borderColor : 'border-gray-200'}`}>
                                                {isCompleted && <CheckCircle className="h-5 w-5" />}
                                            </div>
                                            {index < array.length - 1 && (
                                                <div className={`w-0.5 h-full absolute top-8 ${
                                                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                                }`} />
                                            )}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className={`font-medium ${isActive ? config.color : 'text-gray-900'}`}>
                                                {config.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actualización automática */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Esta página se actualiza automáticamente cada 10 segundos
                    </p>
                </div>
            </div>
        </>
    );
}
