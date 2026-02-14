import adminService, { FiltrosPedidos } from '@/services/adminService';
import { Pedido } from '@/services/pedidoService';
import { useEffect, useState } from 'react';

interface UseAdminPedidosResult {
    pedidos: Pedido[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    lastPage: number;
    total: number;
    refetch: () => void;
    cambiarEstado: (pedidoId: number, estado: string) => Promise<void>;
    cerrarMesa: (pedidoId: number) => Promise<void>;
    cambiandoEstado: boolean;
}

/**
 * Hook para gestionar pedidos en el panel de administración
 * Implementa polling cada 30 segundos para actualización automática
 */
export const useAdminPedidos = (filtros?: FiltrosPedidos): UseAdminPedidosResult => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [cambiandoEstado, setCambiandoEstado] = useState<boolean>(false);

    const refetch = () => {
        setRefreshKey((prev) => prev + 1);
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const fetchPedidos = async () => {
            try {
                setLoading(true);
                const data = await adminService.obtenerPedidos({ ...filtros, page: filtros?.page || 1 });
                setPedidos(data.data);
                setCurrentPage(data.current_page);
                setLastPage(data.last_page);
                setTotal(data.total);
                setError(null);
            } catch (err) {
                setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al obtener los pedidos');
                console.error('Error fetching pedidos:', err);
            } finally {
                setLoading(false);
            }
        };

        // Fetch inicial
        fetchPedidos();

        // Polling cada 30 segundos
        intervalId = setInterval(() => {
            fetchPedidos();
        }, 30000);

        // Cleanup
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [filtros?.estado, filtros?.mesa_id, filtros?.page, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const cambiarEstado = async (pedidoId: number, estado: string) => {
        try {
            setCambiandoEstado(true);
            await adminService.cambiarEstadoPedido(
                pedidoId,
                estado as 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado',
            );
            refetch();
        } catch (err) {
            throw new Error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cambiar el estado');
        } finally {
            setCambiandoEstado(false);
        }
    };

    const cerrarMesa = async (pedidoId: number) => {
        try {
            setCambiandoEstado(true);
            await adminService.cerrarMesa(pedidoId);
            refetch();
        } catch (err) {
            throw new Error((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cerrar la mesa');
        } finally {
            setCambiandoEstado(false);
        }
    };

    return {
        pedidos,
        loading,
        error,
        currentPage,
        lastPage,
        total,
        refetch,
        cambiarEstado,
        cerrarMesa,
        cambiandoEstado,
    };
};
