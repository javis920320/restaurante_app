import { Badge } from '@/components/ui/badge';

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

interface PagoBadgeProps {
    payment_status: PaymentStatus | string;
}

const paymentConfig: Record<string, { label: string; className: string }> = {
    pending: {
        label: 'Pago: Pendiente',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    },
    paid: {
        label: 'Pago: Pagado',
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
    },
    cancelled: {
        label: 'Pago: Cancelado',
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
    },
    refunded: {
        label: 'Pago: Reembolsado',
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
};

export default function PagoBadge({ payment_status }: PagoBadgeProps) {
    const config = paymentConfig[payment_status] ?? paymentConfig.pending;

    return (
        <Badge variant="secondary" className={config.className}>
            {config.label}
        </Badge>
    );
}
