import { useEffect, useState } from 'react';
import axios from 'axios';

interface VentaPorHora {
    hora: number;
    total_pedidos: number;
    total_ventas: number;
}

interface ProductoMasVendido {
    producto: string;
    cantidad: number;
    ventas: number;
}

interface DashboardReportes {
    ventas_por_hora: VentaPorHora[];
    productos_mas_vendidos: ProductoMasVendido[];
    total_pedidos_dia: number;
    tiempo_promedio_preparacion: number;
}

interface UseReportesOptions {
    pollingInterval?: number; // in seconds, default 60
    enabled?: boolean;
}

export function useReportes(options: UseReportesOptions = {}) {
    const { pollingInterval = 60, enabled = true } = options;

    const [reportes, setReportes] = useState<DashboardReportes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReportes = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard/reportes');
            setReportes(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchReportes();

        // Set up polling
        const interval = setInterval(() => {
            fetchReportes();
        }, pollingInterval * 1000);

        return () => clearInterval(interval);
    }, [pollingInterval, enabled]);

    return {
        reportes,
        loading,
        error,
        refetch: fetchReportes,
    };
}
