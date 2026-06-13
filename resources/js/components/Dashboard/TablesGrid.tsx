import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, Users } from 'lucide-react';

interface MesaStatus {
    id: number;
    nombre: string;
    estado: 'disponible' | 'ocupada';
    capacidad: number;
    pedidos_activos: number;
    total_acumulado: number;
    tiempo_ocupada: number | null;
}

interface TablesGridProps {
    mesas: MesaStatus[];
    loading: boolean;
}

export function TablesGrid({ mesas, loading }: TablesGridProps) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const mesasOcupadas = mesas.filter((m) => m.estado === 'ocupada');
    const mesasDisponibles = mesas.filter((m) => m.estado === 'disponible');

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-3">
                <Badge className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30 gap-1.5 px-3 py-1 font-bold text-xs shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    {mesasDisponibles.length} Libres
                </Badge>
                <Badge className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30 gap-1.5 px-3 py-1 font-bold text-xs shadow-sm">
                    <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    {mesasOcupadas.length} Ocupadas
                </Badge>
            </div>

            {/* Tables Grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mesas.map((mesa) => (
                    <TableCard key={mesa.id} mesa={mesa} />
                ))}
            </div>

            {mesas.length === 0 && (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="py-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">No hay mesas activas</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

interface TableCardProps {
    mesa: MesaStatus;
}

function TableCard({ mesa }: TableCardProps) {
    const isOcupada = mesa.estado === 'ocupada';

    return (
        <Card className={`transition-all duration-300 rounded-3xl hover:shadow-md ${
            isOcupada
                ? 'border-purple-200 bg-gradient-to-br from-purple-50/70 to-white dark:border-purple-900/40 dark:from-purple-950/20 dark:to-slate-950 shadow-sm shadow-purple-500/5'
                : 'border-slate-200 bg-white hover:border-slate-350 dark:border-slate-800 dark:bg-slate-950'
        }`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-850 dark:text-slate-100">{mesa.nombre}</CardTitle>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                            <Users className="h-3.5 w-3.5" />
                            Capacidad: {mesa.capacidad} personas
                        </p>
                    </div>
                    {isOcupada ? (
                        <Badge className="rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/30 text-xs font-bold gap-1.5 px-2.5 py-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                            </span>
                            Ocupada
                        </Badge>
                    ) : (
                        <Badge className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-450 dark:border-emerald-900/30 text-xs font-bold gap-1 px-2.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Libre
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {isOcupada ? (
                    <>
                        {/* Active orders */}
                        <div className="flex items-center justify-between text-sm py-1 border-b border-purple-100/30 dark:border-purple-900/10">
                            <span className="text-slate-550 dark:text-slate-400">Pedidos activos:</span>
                            <span className="font-extrabold text-slate-900 dark:text-white">{mesa.pedidos_activos}</span>
                        </div>

                        {/* Accumulated total */}
                        <div className="flex items-center justify-between text-sm py-1 border-b border-purple-100/30 dark:border-purple-900/10">
                            <span className="text-slate-550 dark:text-slate-400">Total acumulado:</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                ${mesa.total_acumulado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Time occupied */}
                        {mesa.tiempo_ocupada !== null && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 py-1">
                                <Clock className="h-3.5 w-3.5 animate-pulse" />
                                <span>Ocupada hace {mesa.tiempo_ocupada}m</span>
                            </div>
                        )}

                        {/* View orders button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full rounded-2xl border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-950/40 dark:hover:text-purple-200 transition-all font-bold"
                            onClick={() => (window.location.href = `/pedidos?mesa_id=${mesa.id}`)}
                        >
                            Ver pedidos
                        </Button>
                    </>
                ) : (
                    <div className="py-5 text-center flex flex-col items-center justify-center">
                        <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-2.5 border border-emerald-100/50 dark:border-emerald-900/20 mb-2">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lista para clientes</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
