import { useState, useEffect } from 'react';
import pedidoService, { Pedido } from '../services/pedidoService';

interface UsePedidoResult {
    pedido: Pedido | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook para obtener y actualizar automáticamente el estado de un pedido
 * Implementa polling cada 10 segundos
 */
export const usePedido = (codigo: string): UsePedidoResult => {
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const refetch = () => {
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const fetchPedido = async () => {
            try {
                setLoading(true);
                const data = await pedidoService.obtenerPedidoPorCodigo(codigo);
                setPedido(data);
                setError(null);
            } catch (err: unknown) {
                const errorMessage = err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al obtener el pedido'
                    : 'Error al obtener el pedido';
                setError(errorMessage);
                console.error('Error fetching pedido:', err);
            } finally {
                setLoading(false);
            }
        };

        // Fetch inicial
        fetchPedido();

        // Polling cada 10 segundos
        intervalId = setInterval(() => {
            fetchPedido();
        }, 10000);

        // Cleanup
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [codigo, refreshKey]);

    return { pedido, loading, error, refetch };
};