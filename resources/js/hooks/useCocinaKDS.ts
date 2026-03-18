import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProductoCocina {
    nombre: string;
    cantidad: number;
    notas?: string;
}

export interface PedidoCocina {
    id: number;
    mesa_nombre: string;
    estado: string;
    tiempo_transcurrido: number;
    productos: ProductoCocina[];
    created_at: string;
    notas?: string;
}

interface UseCocinaKDSOptions {
    pollingInterval?: number;
}

interface UseCocinaKDSResult {
    pedidos: PedidoCocina[];
    loading: boolean;
    error: string | null;
    actionError: string | null;
    marcarListo: (pedidoId: number) => Promise<void>;
    marcarEnPreparacion: (pedidoId: number) => Promise<void>;
    refetch: () => void;
}

export const useCocinaKDS = ({ pollingInterval = 10 }: UseCocinaKDSOptions = {}): UseCocinaKDSResult => {
    const [pedidos, setPedidos] = useState<PedidoCocina[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const refetch = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await axios.get<PedidoCocina[]>('/api/admin/cocina/pedidos');
                setPedidos(response.data);
                setError(null);
            } catch (err) {
                setError('Error al obtener pedidos de cocina');
                console.error('Error fetching cocina pedidos:', err);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchPedidos();

        intervalRef.current = setInterval(fetchPedidos, pollingInterval * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [pollingInterval, refreshKey]);

    const marcarEnPreparacion = useCallback(async (pedidoId: number) => {
        try {
            await axios.patch(`/api/pedidos/${pedidoId}/estado`, { estado: 'en_preparacion' });
            setActionError(null);
            refetch();
        } catch (err) {
            setActionError(`Error al iniciar preparación del pedido #${pedidoId}`);
            console.error('Error al iniciar preparación:', err);
        }
    }, [refetch]);

    const marcarListo = useCallback(async (pedidoId: number) => {
        try {
            await axios.patch(`/api/pedidos/${pedidoId}/estado`, { estado: 'listo' });
            setActionError(null);
            refetch();
        } catch (err) {
            setActionError(`Error al marcar como listo el pedido #${pedidoId}`);
            console.error('Error al marcar como listo:', err);
        }
    }, [refetch]);

    return {
        pedidos,
        loading,
        error,
        actionError,
        marcarListo,
        marcarEnPreparacion,
        refetch,
    };
};
