import { useEffect, useState } from 'react';
import axios from 'axios';

interface ProductoResumen {
    nombre: string;
    cantidad: number;
}

interface PedidoKanban {
    id: number;
    codigo: number;
    mesa: {
        id: number;
        nombre: string;
    };
    estado: string;
    total: number;
    created_at: string;
    tiempo_transcurrido: number;
    productos_resumen: ProductoResumen[];
}

interface PedidosKanbanData {
    pendiente: PedidoKanban[];
    confirmado: PedidoKanban[];
    en_preparacion: PedidoKanban[];
    listo: PedidoKanban[];
    entregado: PedidoKanban[];
}

interface UsePedidosKanbanOptions {
    pollingInterval?: number; // in seconds, default 10
    enabled?: boolean;
}

export function usePedidosKanban(options: UsePedidosKanbanOptions = {}) {
    const { pollingInterval = 10, enabled = true } = options;

    const [pedidos, setPedidos] = useState<PedidosKanbanData>({
        pendiente: [],
        confirmado: [],
        en_preparacion: [],
        listo: [],
        entregado: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPedidosKanban = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard/pedidos-kanban');
            setPedidos(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar pedidos');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        try {
            await axios.patch(`/api/pedidos/${pedidoId}/estado`, {
                estado: nuevoEstado,
            });
            // Refresh data after state change
            await fetchPedidosKanban();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cambiar estado');
            throw err;
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchPedidosKanban();

        // Set up polling
        const interval = setInterval(() => {
            fetchPedidosKanban();
        }, pollingInterval * 1000);

        return () => clearInterval(interval);
    }, [pollingInterval, enabled]);

    return {
        pedidos,
        loading,
        error,
        refetch: fetchPedidosKanban,
        cambiarEstado,
    };
}
