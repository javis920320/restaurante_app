import { Badge } from '@/components/ui/badge';

/** Operational states. 'pagado' is kept for backward-compat with historical records. */
interface EstadoBadgeProps {
    estado: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado' | 'pagado';
}

const estadosConfig = {
    pendiente: {
        label: 'Pendiente',
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    },
    confirmado: {
        label: 'Confirmado',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    },
    en_preparacion: {
        label: 'En Preparación',
        variant: 'default' as const,
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    },
    listo: {
        label: 'Listo',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    entregado: {
        label: 'Entregado',
        variant: 'default' as const,
        className: 'bg-green-200 text-green-900 hover:bg-green-300',
    },
    pagado: {
        label: 'Pagado',
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    },
    cancelado: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
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
