import { Producto } from '@/services/menuService';
import React, { createContext, useCallback, useContext, useReducer } from 'react';

export interface CarritoItem {
    producto: Producto;
    cantidad: number;
    notas?: string;
}

interface CarritoState {
    items: CarritoItem[];
    total: number; // Total calculado solo para visualización
}

type CarritoAction =
    | { type: 'AGREGAR_PRODUCTO'; payload: { producto: Producto; notas?: string } }
    | { type: 'AUMENTAR_CANTIDAD'; payload: { productoId: number } }
    | { type: 'DISMINUIR_CANTIDAD'; payload: { productoId: number } }
    | { type: 'ELIMINAR_PRODUCTO'; payload: { productoId: number } }
    | { type: 'ACTUALIZAR_NOTAS'; payload: { productoId: number; notas: string } }
    | { type: 'LIMPIAR_CARRITO' };

interface CarritoContextType {
    state: CarritoState;
    agregarProducto: (producto: Producto, notas?: string) => void;
    aumentarCantidad: (productoId: number) => void;
    disminuirCantidad: (productoId: number) => void;
    eliminarProducto: (productoId: number) => void;
    actualizarNotas: (productoId: number, notas: string) => void;
    limpiarCarrito: () => void;
    cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// Función auxiliar para calcular el total
const calcularTotal = (items: CarritoItem[]): number => {
    return items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
};

// Reducer para manejar el estado del carrito
const carritoReducer = (state: CarritoState, action: CarritoAction): CarritoState => {
    switch (action.type) {
        case 'AGREGAR_PRODUCTO': {
            const existingItemIndex = state.items.findIndex((item) => item.producto.id === action.payload.producto.id);

            let newItems: CarritoItem[];

            if (existingItemIndex >= 0) {
                // Si el producto ya existe, aumentar cantidad
                newItems = state.items.map((item, index) => (index === existingItemIndex ? { ...item, cantidad: item.cantidad + 1 } : item));
            } else {
                // Si no existe, agregar nuevo
                newItems = [
                    ...state.items,
                    {
                        producto: action.payload.producto,
                        cantidad: 1,
                        notas: action.payload.notas,
                    },
                ];
            }

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'AUMENTAR_CANTIDAD': {
            const newItems = state.items.map((item) =>
                item.producto.id === action.payload.productoId ? { ...item, cantidad: item.cantidad + 1 } : item,
            );

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'DISMINUIR_CANTIDAD': {
            const newItems = state.items
                .map((item) => (item.producto.id === action.payload.productoId ? { ...item, cantidad: item.cantidad - 1 } : item))
                .filter((item) => item.cantidad > 0);

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'ELIMINAR_PRODUCTO': {
            const newItems = state.items.filter((item) => item.producto.id !== action.payload.productoId);

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'ACTUALIZAR_NOTAS': {
            const newItems = state.items.map((item) =>
                item.producto.id === action.payload.productoId ? { ...item, notas: action.payload.notas } : item,
            );

            return {
                ...state,
                items: newItems,
            };
        }

        case 'LIMPIAR_CARRITO':
            return {
                items: [],
                total: 0,
            };

        default:
            return state;
    }
};

// Provider del contexto
export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(carritoReducer, {
        items: [],
        total: 0,
    });

    const agregarProducto = useCallback((producto: Producto, notas?: string) => {
        dispatch({ type: 'AGREGAR_PRODUCTO', payload: { producto, notas } });
    }, []);

    const aumentarCantidad = useCallback((productoId: number) => {
        dispatch({ type: 'AUMENTAR_CANTIDAD', payload: { productoId } });
    }, []);

    const disminuirCantidad = useCallback((productoId: number) => {
        dispatch({ type: 'DISMINUIR_CANTIDAD', payload: { productoId } });
    }, []);

    const eliminarProducto = useCallback((productoId: number) => {
        dispatch({ type: 'ELIMINAR_PRODUCTO', payload: { productoId } });
    }, []);

    const actualizarNotas = useCallback((productoId: number, notas: string) => {
        dispatch({ type: 'ACTUALIZAR_NOTAS', payload: { productoId, notas } });
    }, []);

    const limpiarCarrito = useCallback(() => {
        dispatch({ type: 'LIMPIAR_CARRITO' });
    }, []);

    const cantidadTotal = state.items.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <CarritoContext.Provider
            value={{
                state,
                agregarProducto,
                aumentarCantidad,
                disminuirCantidad,
                eliminarProducto,
                actualizarNotas,
                limpiarCarrito,
                cantidadTotal,
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
};

// Hook personalizado para usar el carrito
export const useCarrito = (): CarritoContextType => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
    }
    return context;
};
