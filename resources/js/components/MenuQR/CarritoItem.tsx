import { Button } from '@/components/ui/button';
import { CarritoItem as ICarritoItem, useCarrito } from '@/context/CarritoContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CarritoItemProps {
    item: ICarritoItem;
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

    const precioUnitario = Number(item.producto.precio) + Number(item.opcion?.precio_extra ?? 0);
    const subtotal = precioUnitario * item.cantidad;
    const opcionId = item.opcion?.id;

    return (
        <div className="border-b border-gray-200 py-3 last:border-0">
            <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.producto.nombre}</h4>
                    {item.opcion && (
                        <p className="text-xs text-blue-600">
                            {item.opcion.nombre}
                            {item.opcion.precio_extra > 0 && ` (+${formatPrice(item.opcion.precio_extra)})`}
                        </p>
                    )}
                    <p className="text-sm text-gray-600">{formatPrice(precioUnitario)}</p>
                    {item.notas && <p className="mt-1 text-xs text-gray-500 italic">Nota: {item.notas}</p>}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarProducto(item.producto.id, opcionId)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => disminuirCantidad(item.producto.id, opcionId)} className="h-8 w-8 p-0">
                        <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-8 text-center font-medium">{item.cantidad}</span>

                    <Button variant="outline" size="sm" onClick={() => aumentarCantidad(item.producto.id, opcionId)} className="h-8 w-8 p-0">
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
        </div>
    );
}
