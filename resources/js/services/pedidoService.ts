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

export interface CrearPedidoMeseroData {
    mesa_id: number;
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

export interface HistorialEstado {
    id: number;
    pedido_id: number;
    estado_anterior: string | null;
    estado_nuevo: string;
    user_id: number | null;
    canal: string | null;
    notas: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
    } | null;
}

export interface Pedido {
    id: number;
    codigo?: string;
    mesa_id: number;
    user_id?: number | null;
    canal?: 'qr' | 'mesero';
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
    historial?: HistorialEstado[];
    cliente?: string | null;
    user?: {
        id: number;
        name: string;
    } | null;
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
     * Crea un nuevo pedido asistido por mesero (requiere autenticación)
     */
    crearPedidoMesero: async (data: CrearPedidoMeseroData): Promise<PedidoResponse> => {
        const response = await api.post<PedidoResponse>('/pedidos/mesero', data);
        return response.data;
    },

    /**
     * Obtiene el estado de un pedido por su código
     * Nota: Usamos el ID del pedido como código
     */
    obtenerPedidoPorCodigo: async (codigo: string): Promise<Pedido> => {
        const response = await api.get<{ pedido: Pedido }>(`/pedidos/${codigo}`);
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
