import { Opcion, Producto } from '@/services/menuService';
import React, { createContext, useCallback, useContext, useReducer } from 'react';

export interface CarritoItem {
    producto: Producto;
    cantidad: number;
    notas?: string;
    opcion?: Opcion;
}

interface CarritoState {
    items: CarritoItem[];
    total: number;
}

// Key to uniquely identify a cart item (product + option combination)
const itemKey = (productoId: number, opcionId?: number) =>
    opcionId ? `${productoId}-${opcionId}` : `${productoId}`;

const itemPrecio = (item: CarritoItem): number =>
    item.producto.precio + (item.opcion?.precio_extra ?? 0);

type CarritoAction =
    | { type: 'AGREGAR_PRODUCTO'; payload: { producto: Producto; notas?: string; opcion?: Opcion } }
    | { type: 'AUMENTAR_CANTIDAD'; payload: { productoId: number; opcionId?: number } }
    | { type: 'DISMINUIR_CANTIDAD'; payload: { productoId: number; opcionId?: number } }
    | { type: 'ELIMINAR_PRODUCTO'; payload: { productoId: number; opcionId?: number } }
    | { type: 'ACTUALIZAR_NOTAS'; payload: { productoId: number; opcionId?: number; notas: string } }
    | { type: 'LIMPIAR_CARRITO' };

interface CarritoContextType {
    state: CarritoState;
    agregarProducto: (producto: Producto, opcion?: Opcion, notas?: string) => void;
    aumentarCantidad: (productoId: number, opcionId?: number) => void;
    disminuirCantidad: (productoId: number, opcionId?: number) => void;
    eliminarProducto: (productoId: number, opcionId?: number) => void;
    actualizarNotas: (productoId: number, notas: string, opcionId?: number) => void;
    limpiarCarrito: () => void;
    cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

const calcularTotal = (items: CarritoItem[]): number => {
    return items.reduce((sum, item) => sum + itemPrecio(item) * item.cantidad, 0);
};

const carritoReducer = (state: CarritoState, action: CarritoAction): CarritoState => {
    switch (action.type) {
        case 'AGREGAR_PRODUCTO': {
            const key = itemKey(action.payload.producto.id, action.payload.opcion?.id);
            const existingItemIndex = state.items.findIndex(
                (item) => itemKey(item.producto.id, item.opcion?.id) === key,
            );

            let newItems: CarritoItem[];

            if (existingItemIndex >= 0) {
                newItems = state.items.map((item, index) => (index === existingItemIndex ? { ...item, cantidad: item.cantidad + 1 } : item));
            } else {
                newItems = [
                    ...state.items,
                    {
                        producto: action.payload.producto,
                        cantidad: 1,
                        notas: action.payload.notas,
                        opcion: action.payload.opcion,
                    },
                ];
            }

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'AUMENTAR_CANTIDAD': {
            const key = itemKey(action.payload.productoId, action.payload.opcionId);
            const newItems = state.items.map((item) =>
                itemKey(item.producto.id, item.opcion?.id) === key ? { ...item, cantidad: item.cantidad + 1 } : item,
            );

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'DISMINUIR_CANTIDAD': {
            const key = itemKey(action.payload.productoId, action.payload.opcionId);
            const newItems = state.items
                .map((item) =>
                    itemKey(item.producto.id, item.opcion?.id) === key ? { ...item, cantidad: item.cantidad - 1 } : item,
                )
                .filter((item) => item.cantidad > 0);

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'ELIMINAR_PRODUCTO': {
            const key = itemKey(action.payload.productoId, action.payload.opcionId);
            const newItems = state.items.filter((item) => itemKey(item.producto.id, item.opcion?.id) !== key);

            return {
                items: newItems,
                total: calcularTotal(newItems),
            };
        }

        case 'ACTUALIZAR_NOTAS': {
            const key = itemKey(action.payload.productoId, action.payload.opcionId);
            const newItems = state.items.map((item) =>
                itemKey(item.producto.id, item.opcion?.id) === key ? { ...item, notas: action.payload.notas } : item,
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

export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(carritoReducer, {
        items: [],
        total: 0,
    });

    const agregarProducto = useCallback((producto: Producto, opcion?: Opcion, notas?: string) => {
        dispatch({ type: 'AGREGAR_PRODUCTO', payload: { producto, opcion, notas } });
    }, []);

    const aumentarCantidad = useCallback((productoId: number, opcionId?: number) => {
        dispatch({ type: 'AUMENTAR_CANTIDAD', payload: { productoId, opcionId } });
    }, []);

    const disminuirCantidad = useCallback((productoId: number, opcionId?: number) => {
        dispatch({ type: 'DISMINUIR_CANTIDAD', payload: { productoId, opcionId } });
    }, []);

    const eliminarProducto = useCallback((productoId: number, opcionId?: number) => {
        dispatch({ type: 'ELIMINAR_PRODUCTO', payload: { productoId, opcionId } });
    }, []);

    const actualizarNotas = useCallback((productoId: number, notas: string, opcionId?: number) => {
        dispatch({ type: 'ACTUALIZAR_NOTAS', payload: { productoId, notas, opcionId } });
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

export const useCarrito = (): CarritoContextType => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
    }
    return context;
};
