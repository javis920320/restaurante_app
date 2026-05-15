import { Badge } from '@/components/ui/badge';

/** Operational states. 'pagado' is kept for backward-compat with historical records. */
interface EstadoBadgeProps {
    estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado' | 'pagado';
}

const estadosConfig = {
    pendiente: {
        label: 'Pendiente',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800',
    },
    confirmado: {
        label: 'Confirmado',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    },
    en_preparacion: {
        label: 'En Preparación',
        variant: 'default' as const,
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800',
    },
    listo: {
        label: 'Listo',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
    },
    entregado: {
        label: 'Entregado',
        variant: 'default' as const,
        className: 'bg-green-200 text-green-900 hover:bg-green-300 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700',
    },
    pagado: {
        label: 'Pagado',
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800',
    },
    cancelado: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800',
    },
};

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
    const config = estadosConfig[estado] || estadosConfig.pendiente;

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}
