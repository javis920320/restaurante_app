import { type KanbanCard as KanbanCardType, type ItemStatus } from '@/hooks/useKanbanItems';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    status: ItemStatus;
    label: string;
    cards: KanbanCardType[];
    dotColor: string;
}

const COLUMN_BG: Record<ItemStatus, string> = {
    pendiente: 'bg-gray-100 border-gray-300',
    en_preparacion: 'bg-blue-50 border-blue-300',
    listo: 'bg-green-50 border-green-300',
    entregado: 'bg-purple-50 border-purple-300',
};

const BADGE_COLORS: Record<ItemStatus, string> = {
    pendiente: 'bg-gray-200 text-gray-700',
    en_preparacion: 'bg-blue-100 text-blue-700',
    listo: 'bg-green-100 text-green-700',
    entregado: 'bg-purple-100 text-purple-700',
};

export default function KanbanColumn({ status, label, cards, dotColor }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <div className="flex w-72 shrink-0 flex-col">
            {/* Column header */}
            <div
                className={`mb-2 flex items-center justify-between rounded-t-lg border px-3 py-2 ${COLUMN_BG[status]}`}
            >
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${BADGE_COLORS[status]}`}>
                    {cards.length}
                </span>
            </div>

            {/* Droppable area */}
            <div
                ref={setNodeRef}
                className={`flex-1 overflow-y-auto rounded-b-lg border p-2 transition-colors ${
                    isOver
                        ? 'border-blue-400 bg-blue-50/60'
                        : 'border-gray-200 bg-gray-50/80'
                }`}
                style={{ minHeight: '12rem', maxHeight: 'calc(100vh - 18rem)' }}
            >
                <div className="space-y-2">
                    {cards.map((card) => (
                        <KanbanCard key={card.group_id} card={card} columnStatus={status} />
                    ))}

                    {cards.length === 0 && (
                        <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-xs text-gray-400">Sin pedidos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
