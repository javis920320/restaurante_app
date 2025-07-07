import { createContext, useContext, useState, ReactNode } from "react";
import { PedidoItem } from "@/types";

interface PedidoState {
    user_id: number;
    mesa_id: number;
    items: PedidoItem[];
    total: number;
    estado: string;
}

interface PedidoContextType extends PedidoState {
    agregarPedido: (item: PedidoItem) => void;
    eliminarPedido: (platoId: number) => void;
    agregarPedidoConCantidad: (item: PedidoItem, cantidad: number) => void;
    limpiarCarrito: () => void;
}

const PedidoContext = createContext<PedidoContextType | undefined>(undefined);

export const PedidoContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pedido, setPedido] = useState<PedidoState>({
        user_id: 0,
        mesa_id: 0,
        items: [],
        total: 0,
        estado: "pendiente",
    });


    const agregarPedido = (item: PedidoItem) => {
        setPedido((prevPedido) => {
            const existe = prevPedido.items.find((pedidoItem) => pedidoItem.plato_id === item.plato_id);

            let nuevosItems;
            if (existe) {
                nuevosItems = prevPedido.items.map((pedidoItem) =>
                    pedidoItem.plato_id === item.plato_id
                        ? { ...pedidoItem, cantidad: item.cantidad }
                        : pedidoItem
                );
            } else {
                nuevosItems = [...prevPedido.items, { ...item, cantidad: item.cantidad }];
            }

            const nuevoTotal = nuevosItems.reduce(
                (total, pedidoItem) => total + pedidoItem.precio * pedidoItem.cantidad,
                0
            );

            return {
                ...prevPedido,
                items: nuevosItems,
                total: nuevoTotal,
            };
        });
    };
    const agregarPedidoConCantidad = (item: PedidoItem, cantidad: number) => {
        setPedido((prevPedido) => {

            const existe = prevPedido.items.find((pedidoItem) => pedidoItem.plato_id === item.plato_id);

            let nuevosItems;
            if (existe) {
                nuevosItems = prevPedido.items.map((pedidoItem) =>
                    pedidoItem.plato_id === item.plato_id
                        ? { ...pedidoItem, cantidad: pedidoItem.cantidad + cantidad }
                        : pedidoItem
                );
            } else {
                nuevosItems = [...prevPedido.items, { ...item, cantidad }];
            }

            const nuevoTotal = nuevosItems.reduce(
                (total, pedidoItem) => total + pedidoItem.precio * pedidoItem.cantidad,
                0
            );

            return {
                ...prevPedido,
                items: nuevosItems,
                total: nuevoTotal,
            };
        }
        );
    };

    const eliminarPedido = (platoId: number) => {
        setPedido((prevPedido) => {
            const nuevosItems = prevPedido.items.filter((pedidoItem) => pedidoItem.plato_id !== platoId);

            const nuevoTotal = nuevosItems.reduce(
                (total, pedidoItem) => total + pedidoItem.precio * pedidoItem.cantidad,
                0
            );

            return {
                ...prevPedido,
                items: nuevosItems,
                total: nuevoTotal,
            };
        });
    };
    const  limpiarCarrito = () => {
        setPedido({
            user_id: 0,
            mesa_id: 0,
            items: [],
            total: 0,
            estado: "pendiente",
        });
    }

    return (
        <PedidoContext.Provider value={{ ...pedido, agregarPedido, eliminarPedido, agregarPedidoConCantidad,limpiarCarrito }}>
            {children}
        </PedidoContext.Provider>
    );
};

export const usePedido = () => {
    const context = useContext(PedidoContext);
    if (!context) {
        throw new Error("usePedido debe ser usado dentro de un PedidoContextProvider");
    }
    return context;
};
