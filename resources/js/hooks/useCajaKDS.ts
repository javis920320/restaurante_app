import api from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface PedidoCaja {
    id: number;
    mesa_nombre: string;
    estado: string;
    payment_status: 'pending' | 'paid' | 'cancelled';
    total: number;
    tiempo_transcurrido: number;
    created_at: string;
    productos_resumen: { nombre: string; cantidad: number }[];
}

export interface CajaData {
    pending: PedidoCaja[];
    paid: PedidoCaja[];
}

interface UseCajaKDSOptions {
    pollingInterval?: number;
    initialData?: CajaData;
}

interface UseCajaKDSResult {
    data: CajaData;
    loading: boolean;
    error: string | null;
    actionError: string | null;
    marcarComoPagado: (pedidoId: number) => Promise<void>;
    cerrarMesa: (pedidoId: number) => Promise<void>;
    refetch: () => void;
}

export const useCajaKDS = ({
    pollingInterval = 15,
    initialData,
}: UseCajaKDSOptions = {}): UseCajaKDSResult => {
    const [data, setData] = useState<CajaData>(initialData ?? { pending: [], paid: [] });
    const [loading, setLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const refetch = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<CajaData>('/admin/caja/pedidos');
                setData(response.data);
                setError(null);
            } catch (err) {
                setError('Error al obtener pedidos de caja');
                console.error('Error fetching caja pedidos:', err);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchData();

        intervalRef.current = setInterval(fetchData, pollingInterval * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [pollingInterval, refreshKey]);

    const marcarComoPagado = useCallback(
        async (pedidoId: number) => {
            try {
                await api.patch(`/pedidos/${pedidoId}/pagar`);
                setActionError(null);
                refetch();
            } catch (err) {
                setActionError(`Error al marcar el pedido #${pedidoId} como pagado`);
                console.error('Error al marcar como pagado:', err);
            }
        },
        [refetch],
    );

    const cerrarMesa = useCallback(
        async (pedidoId: number) => {
            try {
                await api.post(`/pedidos/${pedidoId}/cerrar-mesa`);
                setActionError(null);
                refetch();
            } catch (err) {
                setActionError(`Error al cerrar la mesa del pedido #${pedidoId}`);
                console.error('Error al cerrar mesa:', err);
            }
        },
        [refetch],
    );

    return {
        data,
        loading,
        error,
        actionError,
        marcarComoPagado,
        cerrarMesa,
        refetch,
    };
};
