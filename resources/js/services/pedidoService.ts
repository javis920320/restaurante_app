import api from './api';

export interface PedidoItem {
    producto_id: number;
    cantidad: number;
    notas?: string;
}

export interface CrearPedidoData {
    qr_token: string;
    items: PedidoItem[];
    notas?: string;
    cliente_id?: number;
}

export interface PedidoDetalle {
    id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    notas?: string;
    producto: {
        id: number;
        nombre: string;
        descripcion?: string;
    };
}

export interface Pedido {
    id: number;
    codigo?: string;
    mesa_id: number;
    estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
    subtotal: number;
    total: number;
    notas?: string;
    created_at: string;
    updated_at: string;
    mesa?: {
        id: number;
        nombre: string;
    };
    detalles?: PedidoDetalle[];
}

export interface PedidoResponse {
    message: string;
    pedido: Pedido;
}

/**
 * Servicio para gestión de pedidos
 */
const pedidoService = {
    /**
     * Crea un nuevo pedido desde el sistema QR
     */
    crearPedido: async (data: CrearPedidoData): Promise<PedidoResponse> => {
        const response = await api.post<PedidoResponse>('/pedidos', data);
        return response.data;
    },

    /**
     * Obtiene el estado de un pedido por su código
     * Nota: Este endpoint aún no existe en el backend, se debe implementar
     */
    obtenerPedidoPorCodigo: async (codigo: string): Promise<Pedido> => {
        const response = await api.get<{ pedido: Pedido }>(`/pedidos/codigo/${codigo}`);
        return response.data.pedido;
    },

    /**
     * Obtiene los detalles de un pedido por su ID
     */
    obtenerPedido: async (id: number): Promise<Pedido> => {
        const response = await api.get<{ pedido: Pedido }>(`/pedidos/${id}`);
        return response.data.pedido;
    },
};

export default pedidoService;
