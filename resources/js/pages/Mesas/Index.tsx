import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Edit, Plus, QrCode, Trash2, Users, Wifi } from 'lucide-react';
import React from 'react';

interface Mesa {
    id: number;
    nombre: string;
    capacidad: number;
    estado: 'disponible' | 'ocupada';
    activa: boolean;
    qr_token: string;
    restaurante_id: number;
    created_at: string;
}

interface Restaurante {
    id: number;
    nombre: string;
}

interface MesasIndexProps {
    mesas: {
        data: Mesa[];
        current_page: number;
        last_page: number;
        total: number;
    };
    restaurantes?: Restaurante[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mesas', href: '/configuracion/mesas' },
];

export default function Index({ mesas, restaurantes = [] }: MesasIndexProps) {
    const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);

    const mesasData = mesas.data || [];
    const mesasDisponibles = mesasData.filter((m) => m.estado === 'disponible' && m.activa);
    const mesasOcupadas = mesasData.filter((m) => m.estado === 'ocupada');

    const handleDelete = (mesaId: number) => {
        if (confirmDelete === mesaId) {
            router.delete(route('mesas.destroy', mesaId), {
                onSuccess: () => setConfirmDelete(null),
            });
        } else {
            setConfirmDelete(mesaId);
        }
    };

    const handleGetQR = (mesa: Mesa) => {
        window.open(route('mesas.generar-qr', mesa.id), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Mesas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Mesas</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Administra las mesas del restaurante y sus códigos QR
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('mesas.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Mesa
                        </Link>
                    </Button>
                </div>

                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Mesas</p>
                                    <p className="text-2xl font-bold">{mesasData.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
                                    <p className="text-2xl font-bold text-green-600">{mesasDisponibles.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                                    <Wifi className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ocupadas</p>
                                    <p className="text-2xl font-bold text-orange-600">{mesasOcupadas.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tables Grid */}
                {mesasData.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Users className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                                No hay mesas configuradas
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Crea la primera mesa para comenzar a gestionar el restaurante
                            </p>
                            <Button asChild className="mt-4">
                                <Link href={route('mesas.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Primera Mesa
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mesasData.map((mesa) => (
                            <MesaCard
                                key={mesa.id}
                                mesa={mesa}
                                onDelete={handleDelete}
                                onGetQR={handleGetQR}
                                isConfirmingDelete={confirmDelete === mesa.id}
                                onCancelDelete={() => setConfirmDelete(null)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {mesas.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: mesas.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === mesas.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(route('mesas.index'), { page })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

interface MesaCardProps {
    mesa: Mesa;
    onDelete: (id: number) => void;
    onGetQR: (mesa: Mesa) => void;
    isConfirmingDelete: boolean;
    onCancelDelete: () => void;
}

function MesaCard({ mesa, onDelete, onGetQR, isConfirmingDelete, onCancelDelete }: MesaCardProps) {
    const isOcupada = mesa.estado === 'ocupada';
    const isInactiva = !mesa.activa;

    return (
        <Card
            className={`transition-all ${
                isInactiva
                    ? 'opacity-60'
                    : isOcupada
                      ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                      : 'border-green-200 dark:border-green-800'
            }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{mesa.nombre}</CardTitle>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-3 w-3" />
                            {mesa.capacidad} personas
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant={isOcupada ? 'default' : 'secondary'}
                            className={
                                isOcupada
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }
                        >
                            {isOcupada ? 'Ocupada' : 'Libre'}
                        </Badge>
                        {isInactiva && (
                            <Badge variant="outline" className="text-xs">
                                Inactiva
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* QR Token info */}
                <p className="truncate text-xs text-gray-500 dark:text-gray-500">
                    Token: {mesa.qr_token.slice(0, 12)}...
                </p>

                {/* Actions */}
                {isConfirmingDelete ? (
                    <div className="space-y-2">
                        <p className="text-center text-xs font-medium text-red-600 dark:text-red-400">
                            ¿Confirmar eliminación?
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => onDelete(mesa.id)}
                            >
                                Eliminar
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onCancelDelete}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => onGetQR(mesa)}
                            title="Ver código QR"
                        >
                            <QrCode className="mr-1 h-3 w-3" />
                            QR
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                            <Link href={route('mesas.edit', mesa.id)}>
                                <Edit className="mr-1 h-3 w-3" />
                                Editar
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                            onClick={() => onDelete(mesa.id)}
                            title="Eliminar mesa"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
