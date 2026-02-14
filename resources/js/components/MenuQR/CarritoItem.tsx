import React from 'react';
import { useCarrito } from '../../context/CarritoContext';
import { Button } from '../ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CarritoItemProps {
    item: {
        producto: {
            id: number;
            nombre: string;
            precio: number;
        };
        cantidad: number;
        notas?: string;
    };
}

export default function CarritoItem({ item }: CarritoItemProps) {
    const { aumentarCantidad, disminuirCantidad, eliminarProducto } = useCarrito();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const subtotal = item.producto.precio * item.cantidad;

    return (
        <div className="border-b border-gray-200 py-3 last:border-0">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.producto.nombre}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(item.producto.precio)}</p>
                    {item.notas && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                            Nota: {item.notas}
                        </p>
                    )}
                </div>
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarProducto(item.producto.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center justify-between">
                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disminuirCantidad(item.producto.id)}
                        className="h-8 w-8 p-0"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium">
                        {item.cantidad}
                    </span>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => aumentarCantidad(item.producto.id)}
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Subtotal */}
                <span className="font-semibold text-gray-900">
                    {formatPrice(subtotal)}
                </span>
            </div>
        </div>
    );
}
