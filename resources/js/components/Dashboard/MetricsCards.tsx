import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';

interface MetricsCardsProps {
    metrics: {
        pedidos_pendientes: number;
        pedidos_en_preparacion: number;
        pedidos_listos: number;
        mesas_ocupadas: number;
        mesas_libres: number;
        ventas_dia: number;
        ticket_promedio: number;
    } | null;
    loading: boolean;
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
    if (loading || !metrics) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(7)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Pedidos Pendientes',
            value: metrics.pedidos_pendientes,
            icon: AlertCircle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'En Preparación',
            value: metrics.pedidos_en_preparacion,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Pedidos Listos',
            value: metrics.pedidos_listos,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Mesas Ocupadas',
            value: metrics.mesas_ocupadas,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Mesas Libres',
            value: metrics.mesas_libres,
            icon: ShoppingBag,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
        },
        {
            title: 'Ventas del Día',
            value: `$${metrics.ventas_dia.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Ticket Promedio',
            value: `$${metrics.ticket_promedio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={`rounded-full p-2 ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
