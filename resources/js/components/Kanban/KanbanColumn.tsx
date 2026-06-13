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
    pendiente: 'bg-slate-100/70 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800',
    en_preparacion: 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
    listo: 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    entregado: 'bg-blue-50/40 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/20',
};

const BADGE_COLORS: Record<ItemStatus, string> = {
    pendiente: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    en_preparacion: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    listo: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    entregado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
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
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{label}</h3>
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
                        ? 'border-blue-400 bg-blue-50/60 dark:border-blue-600 dark:bg-blue-950/60'
                        : 'border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/80'
                }`}
                style={{ minHeight: '12rem', maxHeight: 'calc(100vh - 18rem)' }}
            >
                <div className="space-y-2">
                    {cards.map((card) => (
                        <KanbanCard key={card.group_id} card={card} columnStatus={status} />
                    ))}

                    {cards.length === 0 && (
                        <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-400 dark:text-gray-500">Sin elementos</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
