import api from '@/services/api';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ItemStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';

export type ProductionArea = 'kitchen' | 'bar';

export interface KanbanItem {
    id: number;
    nombre: string;
    cantidad: number;
    notas?: string | null;
    estado: ItemStatus;
}

export interface KanbanCard {
    group_id: string;
    pedido_id: number;
    mesa: { id: number; nombre: string };
    created_at: string;
    tiempo_transcurrido: number;
    item_ids: number[];
    items: KanbanItem[];
}

export interface KanbanColumns {
    pendiente: KanbanCard[];
    en_preparacion: KanbanCard[];
    listo: KanbanCard[];
    entregado: KanbanCard[];
}

/** Valid forward transitions for drag & drop */
export const VALID_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
    pendiente: ['en_preparacion'],
    en_preparacion: ['listo'],
    listo: ['entregado'],
    entregado: [],
};

interface UseKanbanItemsOptions {
    area: ProductionArea;
    pollingInterval?: number;
    enabled?: boolean;
}

interface UseKanbanItemsResult {
    columns: KanbanColumns;
    loading: boolean;
    error: string | null;
    actionError: string | null;
    moverGrupo: (card: KanbanCard, fromStatus: ItemStatus, toStatus: ItemStatus) => Promise<void>;
    refetch: () => void;
}

const EMPTY_COLUMNS: KanbanColumns = {
    pendiente: [],
    en_preparacion: [],
    listo: [],
    entregado: [],
};

export function useKanbanItems({
    area,
    pollingInterval = 10,
    enabled = true,
}: UseKanbanItemsOptions): UseKanbanItemsResult {
    const [columns, setColumns] = useState<KanbanColumns>(EMPTY_COLUMNS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        if (!enabled) return;

        const fetchData = async () => {
            try {
                const response = await api.get<KanbanColumns>(`/admin/kanban/${area}`);
                setColumns(response.data);
                setError(null);
            } catch (err: unknown) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Error al cargar el tablero Kanban');
                } else {
                    setError('Error al cargar el tablero Kanban');
                }
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchData();

        intervalRef.current = setInterval(fetchData, pollingInterval * 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [area, pollingInterval, enabled, refreshKey]);

    /**
     * Optimistically move a card to a new column then persist to the backend.
     * On error the previous state is restored.
     */
    const moverGrupo = useCallback(
        async (card: KanbanCard, fromStatus: ItemStatus, toStatus: ItemStatus) => {
            if (!VALID_TRANSITIONS[fromStatus].includes(toStatus)) {
                setActionError(
                    `Movimiento no permitido: ${fromStatus} → ${toStatus}`,
                );
                return;
            }

            // Optimistic update
            setColumns((prev) => {
                const next: KanbanColumns = {
                    pendiente: [...prev.pendiente],
                    en_preparacion: [...prev.en_preparacion],
                    listo: [...prev.listo],
                    entregado: [...prev.entregado],
                };
                next[fromStatus] = next[fromStatus].filter((c) => c.group_id !== card.group_id);
                const updatedCard: KanbanCard = {
                    ...card,
                    items: card.items.map((i) => ({ ...i, estado: toStatus })),
                };
                next[toStatus] = [...next[toStatus], updatedCard];
                return next;
            });

            try {
                await api.patch(`/pedidos/${card.pedido_id}/detalles/estado-bulk`, {
                    item_ids: card.item_ids,
                    estado: toStatus,
                });
                setActionError(null);
                // Refresh to get authoritative server state
                refetch();
            } catch (err: unknown) {
                // Revert optimistic update on failure
                setColumns((prev) => {
                    const next: KanbanColumns = {
                        pendiente: [...prev.pendiente],
                        en_preparacion: [...prev.en_preparacion],
                        listo: [...prev.listo],
                        entregado: [...prev.entregado],
                    };
                    next[toStatus] = next[toStatus].filter((c) => c.group_id !== card.group_id);
                    next[fromStatus] = [...next[fromStatus], card];
                    return next;
                });

                if (isAxiosError(err)) {
                    setActionError(
                        err.response?.data?.message || 'Error al mover el pedido',
                    );
                } else {
                    setActionError('Error al mover el pedido');
                }
            }
        },
        [refetch],
    );

    return { columns, loading, error, actionError, moverGrupo, refetch };
}
