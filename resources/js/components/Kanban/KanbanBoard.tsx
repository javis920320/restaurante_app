import {
    type ItemStatus,
    type KanbanCard as KanbanCardType,
    type ProductionArea,
    VALID_TRANSITIONS,
    useKanbanItems,
} from '@/hooks/useKanbanItems';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import KanbanCard from './KanbanCard';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
    area: ProductionArea;
    title?: string;
    pollingInterval?: number;
}

const COLUMNS: { status: ItemStatus; label: string; color: string }[] = [
    { status: 'pendiente', label: 'Pendiente', color: 'bg-gray-400' },
    { status: 'en_preparacion', label: 'En Preparación', color: 'bg-blue-500' },
    { status: 'listo', label: 'Listo', color: 'bg-green-500' },
    { status: 'entregado', label: 'Entregado', color: 'bg-purple-500' },
];

export default function KanbanBoard({ area, title, pollingInterval = 10 }: KanbanBoardProps) {
    const { columns, loading, error, actionError, moverGrupo, refetch } = useKanbanItems({
        area,
        pollingInterval,
    });

    const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
    const [activeColumnStatus, setActiveColumnStatus] = useState<ItemStatus | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );

    function handleDragStart(event: DragStartEvent) {
        const data = event.active.data.current as { card: KanbanCardType; columnStatus: ItemStatus } | undefined;
        if (data) {
            setActiveCard(data.card);
            setActiveColumnStatus(data.columnStatus);
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveCard(null);
        setActiveColumnStatus(null);

        const { active, over } = event;
        if (!over) return;

        const data = active.data.current as { card: KanbanCardType; columnStatus: ItemStatus } | undefined;
        if (!data) return;

        const fromStatus = data.columnStatus;
        const toStatus = over.id as ItemStatus;

        if (fromStatus === toStatus) return;

        if (!VALID_TRANSITIONS[fromStatus].includes(toStatus)) return;

        await moverGrupo(data.card, fromStatus, toStatus);
    }

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Cargando tablero...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Board header */}
            <div className="flex items-center justify-between">
                {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}
                <button
                    onClick={refetch}
                    className="ml-auto flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Actualizar
                </button>
            </div>

            {/* Error alerts */}
            {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}
            {actionError && (
                <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {actionError}
                </div>
            )}

            {/* Board columns */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map(({ status, label, color }) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            label={label}
                            cards={columns[status]}
                            color={color}
                        />
                    ))}
                </div>

                {/* Drag overlay – renders a floating clone while dragging */}
                <DragOverlay dropAnimation={null}>
                    {activeCard && activeColumnStatus ? (
                        <div className="rotate-2 opacity-90">
                            <KanbanCard card={activeCard} columnStatus={activeColumnStatus} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
