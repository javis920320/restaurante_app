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
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100/50 dark:border-amber-500/20',
        },
        {
            title: 'En Preparación',
            value: metrics.pedidos_en_preparacion,
            icon: Clock,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100/50 dark:border-blue-500/20',
        },
        {
            title: 'Pedidos Listos',
            value: metrics.pedidos_listos,
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20',
        },
        {
            title: 'Mesas Ocupadas',
            value: metrics.mesas_ocupadas,
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100/50 dark:border-purple-500/20',
        },
        {
            title: 'Mesas Libres',
            value: metrics.mesas_libres,
            icon: ShoppingBag,
            color: 'text-slate-600 dark:text-slate-450',
            bgColor: 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700/50',
        },
        {
            title: 'Ventas del Día',
            value: `$${metrics.ventas_dia.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20',
        },
        {
            title: 'Ticket Promedio',
            value: `$${metrics.ticket_promedio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</CardTitle>
                            <div className={`rounded-full p-2 border ${card.bgColor}`}>
                                <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{card.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
