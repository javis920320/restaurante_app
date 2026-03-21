import api from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProductoBar {
    id: number;
    nombre: string;
    cantidad: number;
    notas?: string;
    production_area: 'kitchen' | 'bar' | 'none';
    estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';
}

export interface PedidoBar {
    id: number;
    mesa_nombre: string;
    estado: string;
    payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded';
    tiempo_transcurrido: number;
    productos: ProductoBar[];
    created_at: string;
    notas?: string;
}

interface UseBarKDSOptions {
    pollingInterval?: number;
}

interface UseBarKDSResult {
    pedidos: PedidoBar[];
    loading: boolean;
    error: string | null;
    actionError: string | null;
    marcarEnPreparacion: (pedidoId: number, detalleId: number) => Promise<void>;
    marcarListo: (pedidoId: number, detalleId: number) => Promise<void>;
    refetch: () => void;
}

export const useBarKDS = ({ pollingInterval = 10 }: UseBarKDSOptions = {}): UseBarKDSResult => {
    const [pedidos, setPedidos] = useState<PedidoBar[]>([]);
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
                const response = await api.get<PedidoBar[]>('/admin/bar/pedidos');
                setPedidos(response.data);
                setError(null);
            } catch (err) {
                setError('Error al obtener pedidos del bar');
                console.error('Error fetching bar pedidos:', err);
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

    const marcarEnPreparacion = useCallback(
        async (pedidoId: number, detalleId: number) => {
            try {
                await api.patch(`/pedidos/${pedidoId}/detalles/${detalleId}/estado`, { estado: 'en_preparacion' });
                setActionError(null);
                refetch();
            } catch (err) {
                setActionError(`Error al iniciar preparación del ítem #${detalleId}`);
                console.error('Error al iniciar preparación:', err);
            }
        },
        [refetch],
    );

    const marcarListo = useCallback(
        async (pedidoId: number, detalleId: number) => {
            try {
                await api.patch(`/pedidos/${pedidoId}/detalles/${detalleId}/estado`, { estado: 'listo' });
                setActionError(null);
                refetch();
            } catch (err) {
                setActionError(`Error al marcar como listo el ítem #${detalleId}`);
                console.error('Error al marcar como listo:', err);
            }
        },
        [refetch],
    );

    return {
        pedidos,
        loading,
        error,
        actionError,
        marcarEnPreparacion,
        marcarListo,
        refetch,
    };
};
