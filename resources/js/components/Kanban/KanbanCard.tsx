import { type KanbanCard as KanbanCardType } from '@/hooks/useKanbanItems';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, UtensilsCrossed } from 'lucide-react';

interface KanbanCardProps {
    card: KanbanCardType;
    columnStatus: string;
}

const TIME_TEXT_COLORS = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    gray: 'text-slate-500 dark:text-slate-400',
} as const;

const TIME_BORDER_COLORS = {
    green: 'border-l-green-400 dark:border-l-green-500',
    yellow: 'border-l-yellow-400 dark:border-l-yellow-500',
    red: 'border-l-red-500 dark:border-l-red-600',
    blue: 'border-l-blue-400 dark:border-l-blue-500',
    gray: 'border-l-slate-300 dark:border-l-slate-700',
} as const;

type TimeLevel = keyof typeof TIME_TEXT_COLORS;

function getTimeLevel(minutes: number, status: string): TimeLevel {
    if (status === 'entregado') return 'blue';
    if (status === 'listo') return 'green';
    if (minutes < 15) return 'green';
    if (minutes < 30) return 'yellow';
    return 'red';
}

function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

export default function KanbanCard({ card, columnStatus }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.group_id,
        data: { card, columnStatus },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    const level = getTimeLevel(card.tiempo_transcurrido, columnStatus);
    const timeTextColor = TIME_TEXT_COLORS[level];
    const borderColor = TIME_BORDER_COLORS[level];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-lg border border-l-4 border-gray-200 ${borderColor} touch-none bg-white p-3 shadow-sm select-none ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : 'hover:shadow-md'} transition-shadow dark:border-gray-700 dark:bg-gray-900`}
        >
            {/* Card Header */}
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
                        <span className="truncate text-xs font-semibold text-gray-800 dark:text-white">Pedido #{card.pedido_id}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-300">{card.mesa.nombre}</p>
                </div>
                {/* Drag handle */}
                <button
                    {...listeners}
                    {...attributes}
                    className="shrink-0 cursor-grab rounded p-0.5 text-gray-300 hover:text-gray-500 focus:outline-none active:cursor-grabbing"
                    aria-label="Arrastrar tarjeta"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Items list */}
            <ul className="mb-2 space-y-0.5">
                {card.items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-1">
                        <span className="min-w-0 truncate text-xs text-gray-700 dark:text-gray-200">{item.nombre}</span>
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            x{item.cantidad}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Footer: time */}
            <div className={`flex items-center gap-1 ${timeTextColor}`}>
                <Clock className="h-3 w-3 shrink-0" />
                <span className="text-xs font-medium">{formatTime(card.tiempo_transcurrido)}</span>
            </div>
        </div>
    );
}
