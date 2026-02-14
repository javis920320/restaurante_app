import api from './api';
import { Pedido } from './pedidoService';

export interface PaginatedPedidos {
    data: Pedido[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface CambiarEstadoData {
    estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
}

export interface FiltrosPedidos {
    estado?: string;
    mesa_id?: number;
    page?: number;
}

/**
 * Servicio para operaciones del panel de administración
 */
const adminService = {
    /**
     * Obtiene la lista de pedidos con paginación y filtros
     */
    obtenerPedidos: async (filtros?: FiltrosPedidos): Promise<PaginatedPedidos> => {
        const params = new URLSearchParams();

        if (filtros?.estado) {
            params.append('estado', filtros.estado);
        }
        if (filtros?.mesa_id) {
            params.append('mesa_id', filtros.mesa_id.toString());
        }
        if (filtros?.page) {
            params.append('page', filtros.page.toString());
        }

        const response = await api.get<{ pedidos: PaginatedPedidos }>(`/pedidos?${params.toString()}`);
        return response.data.pedidos;
    },

    /**
     * Cambia el estado de un pedido
     */
    cambiarEstadoPedido: async (pedidoId: number, estado: CambiarEstadoData['estado']): Promise<Pedido> => {
        const response = await api.patch<{ pedido: Pedido }>(`/pedidos/${pedidoId}/estado`, { estado });
        return response.data.pedido;
    },

    /**
     * Cierra una mesa (marca el pedido como pagado y libera la mesa)
     */
    cerrarMesa: async (pedidoId: number): Promise<Pedido> => {
        const response = await api.post<{ pedido: Pedido }>(`/pedidos/${pedidoId}/cerrar-mesa`);
        return response.data.pedido;
    },
};

export default adminService;
