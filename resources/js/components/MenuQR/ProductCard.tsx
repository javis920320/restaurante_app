import { Button } from '@/components/ui/button';
import { useCarrito } from '@/context/CarritoContext';
import { Producto } from '@/services/menuService';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

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
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="flex gap-4 p-4">
                {/* Imagen del producto */}
                {producto.imagen && (
                    <div className="flex-shrink-0">
                        <img src={producto.imagen} alt={producto.nombre} className="h-24 w-24 rounded-lg object-cover" />
                    </div>
                )}

                {/* Información del producto */}
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{producto.nombre}</h3>

                    {producto.descripcion && <p className="mb-2 line-clamp-2 text-sm text-gray-600">{producto.descripcion}</p>}

                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">{formatPrice(producto.precio)}</span>

                        <Button onClick={handleAgregar} size="sm" className={agregado ? 'bg-green-600 hover:bg-green-700' : ''}>
                            {agregado ? (
                                <>
                                    <Check className="mr-1 h-4 w-4" />
                                    Agregado
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-1 h-4 w-4" />
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
