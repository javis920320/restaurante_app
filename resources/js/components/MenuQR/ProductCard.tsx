import { Button } from '@/components/ui/button';
import { useCarrito } from '@/context/CarritoContext';
import { Opcion, Producto } from '@/services/menuService';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
    producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
    const { agregarProducto } = useCarrito();
    const [agregado, setAgregado] = useState(false);
    const [opcionSeleccionada, setOpcionSeleccionada] = useState<Opcion | null>(null);

    const tieneOpciones = producto.opciones && producto.opciones.length > 0;
    const precioFinal = producto.precio + (opcionSeleccionada?.precio_extra ?? 0);

    const handleAgregar = () => {
        agregarProducto(producto, opcionSeleccionada ?? undefined);
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
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex gap-4 p-4">
                {/* Imagen del producto */}
                {producto.imagen && (
                    <div className="flex-shrink-0">
                        <img src={producto.imagen} alt={producto.nombre} className="h-24 w-24 rounded-lg object-cover" />
                    </div>
                )}

                {/* Información del producto */}
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{producto.nombre}</h3>

                    {producto.descripcion && <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{producto.descripcion}</p>}

                    {/* Opciones/Variantes */}
                    {tieneOpciones && (
                        <div className="mb-2">
                            <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Opciones:</p>
                            <div className="flex flex-wrap gap-1">
                                {producto.opciones!.map((opcion) => (
                                    <button
                                        key={opcion.id}
                                        onClick={() => setOpcionSeleccionada(opcionSeleccionada?.id === opcion.id ? null : opcion)}
                                        className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                                            opcionSeleccionada?.id === opcion.id
                                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        {opcion.nombre}
                                        {opcion.precio_extra > 0 && (
                                            <span className="ml-1 text-green-600">+{formatPrice(opcion.precio_extra)}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">{formatPrice(precioFinal)}</span>

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
