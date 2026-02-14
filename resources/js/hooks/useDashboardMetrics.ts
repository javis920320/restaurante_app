import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardMetrics {
    pedidos_pendientes: number;
    pedidos_en_preparacion: number;
    pedidos_listos: number;
    mesas_ocupadas: number;
    mesas_libres: number;
    ventas_dia: number;
    ticket_promedio: number;
}

interface UseDashboardMetricsOptions {
    pollingInterval?: number; // in seconds, default 10
    enabled?: boolean;
}

export function useDashboardMetrics(options: UseDashboardMetricsOptions = {}) {
    const { pollingInterval = 10, enabled = true } = options;

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard/metrics');
            setMetrics(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar métricas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchMetrics();

        // Set up polling
        const interval = setInterval(() => {
            fetchMetrics();
        }, pollingInterval * 1000);

        return () => clearInterval(interval);
    }, [pollingInterval, enabled]);

    return {
        metrics,
        loading,
        error,
        refetch: fetchMetrics,
    };
}
