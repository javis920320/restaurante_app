import { Producto } from '@/services/menuService';
import ProductCard from './ProductCard';

interface CategorySectionProps {
    categoria: {
        id: number;
        nombre: string;
        productos: Producto[];
    };
}

export default function CategorySection({ categoria }: CategorySectionProps) {
    // Solo mostrar productos activos y disponibles
    const productosVisibles = categoria.productos.filter((p) => p.activo && p.disponible);

    if (productosVisibles.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="border-b-2 border-gray-200 pb-2 text-xl font-bold text-gray-900">{categoria.nombre}</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {productosVisibles.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                ))}
            </div>
        </div>
    );
}
