import { KanbanBoard } from '@/components/Dashboard/KanbanBoard';
import { MetricsCards } from '@/components/Dashboard/MetricsCards';
import { QuickReports } from '@/components/Dashboard/QuickReports';
import { TablesGrid } from '@/components/Dashboard/TablesGrid';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useMesasStatus } from '@/hooks/useMesasStatus';
import { usePedidosKanban } from '@/hooks/usePedidosKanban';
import { useReportes } from '@/hooks/useReportes';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LayoutDashboard, RefreshCw, TrendingUp, UtensilsCrossed } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Index() {
    const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics({
        pollingInterval: 10,
    });

    const { pedidos, loading: pedidosLoading, cambiarEstado } = usePedidosKanban({
        pollingInterval: 10,
    });

    const { mesas, loading: mesasLoading, refetch: refetchMesas } = useMesasStatus({
        pollingInterval: 15,
    });

    const { reportes, loading: reportesLoading } = useReportes({
        pollingInterval: 60,
    });

    const handleRefreshAll = () => {
        refetchMetrics();
        refetchMesas();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Administrativo" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                        <p className="mt-1 text-gray-600">Monitoreo en tiempo real del restaurante</p>
                    </div>
                    <Button onClick={handleRefreshAll} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                {/* Metrics Cards */}
                <MetricsCards metrics={metrics} loading={metricsLoading} />

                <Separator />

                {/* Tabs for different views */}
                <Tabs defaultValue="kanban" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="kanban" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Vista Kanban
                        </TabsTrigger>
                        <TabsTrigger value="mesas" className="gap-2">
                            <UtensilsCrossed className="h-4 w-4" />
                            Estado de Mesas
                        </TabsTrigger>
                        <TabsTrigger value="reportes" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Reportes Rápidos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="kanban" className="space-y-4">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Panel Operativo de Pedidos</h2>
                            <KanbanBoard pedidos={pedidos} loading={pedidosLoading} onCambiarEstado={cambiarEstado} />
                        </div>
                    </TabsContent>

                    <TabsContent value="mesas" className="space-y-4">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Estado de Mesas</h2>
                            <TablesGrid mesas={mesas} loading={mesasLoading} />
                        </div>
                    </TabsContent>

                    <TabsContent value="reportes" className="space-y-4">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Reportes del Día</h2>
                            <QuickReports reportes={reportes} loading={reportesLoading} />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Auto-refresh indicator */}
                <div className="text-center text-sm text-gray-500">
                    <p>
                        Dashboard actualizado automáticamente • Métricas: cada 10s • Mesas: cada 15s • Reportes: cada
                        60s
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
