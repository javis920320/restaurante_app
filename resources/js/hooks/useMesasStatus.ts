import { useEffect, useState } from 'react';
import axios from 'axios';

interface MesaStatus {
    id: number;
    nombre: string;
    estado: 'disponible' | 'ocupada';
    capacidad: number;
    pedidos_activos: number;
    total_acumulado: number;
    tiempo_ocupada: number | null;
}

interface UseMesasStatusOptions {
    pollingInterval?: number; // in seconds, default 10
    enabled?: boolean;
}

export function useMesasStatus(options: UseMesasStatusOptions = {}) {
    const { pollingInterval = 10, enabled = true } = options;

    const [mesas, setMesas] = useState<MesaStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMesasStatus = async () => {
        try {
            const response = await axios.get('/api/admin/mesas/status');
            setMesas(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar estado de mesas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchMesasStatus();

        // Set up polling
        const interval = setInterval(() => {
            fetchMesasStatus();
        }, pollingInterval * 1000);

        return () => clearInterval(interval);
    }, [pollingInterval, enabled]);

    return {
        mesas,
        loading,
        error,
        refetch: fetchMesasStatus,
    };
}
