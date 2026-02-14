import React, { useState } from 'react';
import { Producto } from '../../services/menuService';
import { useCarrito } from '../../context/CarritoContext';
import { Button } from '../ui/button';
import { Plus, Check } from 'lucide-react';

interface ProductCardProps {
    producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
    const { agregarProducto } = useCarrito();
    const [agregado, setAgregado] = useState(false);

    const handleAgregar = () => {
        agregarProducto(producto);
        setAgregado(true);
        
        // Reset after animation
        setTimeout(() => {
            setAgregado(false);
        }, 1500);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
            <div className="flex gap-4 p-4">
                {/* Imagen del producto */}
                {producto.imagen && (
                    <div className="flex-shrink-0">
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    </div>
                )}

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {producto.nombre}
                    </h3>
                    
                    {producto.descripcion && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {producto.descripcion}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg font-bold text-green-600">
                            {formatPrice(producto.precio)}
                        </span>
                        
                        <Button
                            onClick={handleAgregar}
                            size="sm"
                            className={agregado ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {agregado ? (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Agregado
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
