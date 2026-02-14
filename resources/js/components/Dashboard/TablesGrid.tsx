import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';

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
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {mesasDisponibles.length} Libres
                </Badge>
                <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    {mesasOcupadas.length} Ocupadas
                </Badge>
            </div>

            {/* Tables Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mesas.map((mesa) => (
                    <TableCard key={mesa.id} mesa={mesa} />
                ))}
            </div>

            {mesas.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-500">No hay mesas activas</p>
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
        <Card className={isOcupada ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{mesa.nombre}</CardTitle>
                        <p className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-3 w-3" />
                            {mesa.capacidad} personas
                        </p>
                    </div>
                    <Badge variant={isOcupada ? 'default' : 'secondary'} className="text-xs">
                        {isOcupada ? 'Ocupada' : 'Libre'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {isOcupada ? (
                    <>
                        {/* Active orders */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Pedidos activos:</span>
                            <span className="font-semibold">{mesa.pedidos_activos}</span>
                        </div>

                        {/* Accumulated total */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Total acumulado:</span>
                            <span className="font-semibold text-green-600">
                                ${mesa.total_acumulado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Time occupied */}
                        {mesa.tiempo_ocupada !== null && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{mesa.tiempo_ocupada} min ocupada</span>
                            </div>
                        )}

                        {/* View orders button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => (window.location.href = `/pedidos?mesa_id=${mesa.id}`)}
                        >
                            Ver pedidos
                        </Button>
                    </>
                ) : (
                    <div className="py-4 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
                        <p className="mt-2 text-sm text-gray-600">Mesa disponible</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
