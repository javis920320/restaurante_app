import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Restaurante {
    id: number;
    nombre: string;
}

interface CreateProps {
    restaurantes: Restaurante[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mesas', href: '/configuracion/mesas' },
    { title: 'Nueva Mesa', href: '/configuracion/mesas/create' },
];

export default function Create({ restaurantes }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        capacidad: 4,
        restaurante_id: restaurantes[0]?.id?.toString() || '',
        estado: 'disponible',
        activa: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mesas.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Mesa" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('mesas.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nueva Mesa</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Se generará un código QR automáticamente
                        </p>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Datos de la Mesa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre de la Mesa</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    placeholder="Ej: Mesa 1, Mesa Terraza A..."
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    disabled={processing}
                                />
                                <InputError message={errors.nombre} />
                            </div>

                            {/* Capacidad */}
                            <div className="space-y-2">
                                <Label htmlFor="capacidad">Capacidad (personas)</Label>
                                <Input
                                    id="capacidad"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={data.capacidad}
                                    onChange={(e) => setData('capacidad', parseInt(e.target.value) || 1)}
                                    disabled={processing}
                                />
                                <InputError message={errors.capacidad} />
                            </div>

                            {/* Restaurante */}
                            {restaurantes.length === 0 ? (
                                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm">
                                    <p className="text-yellow-800 font-medium">No hay restaurantes disponibles.</p>
                                    <p className="mt-1 text-yellow-700">
                                        Debes{' '}
                                        <Link
                                            href={route('restaurantes.index')}
                                            className="underline font-semibold hover:text-yellow-900"
                                        >
                                            crear un restaurante
                                        </Link>{' '}
                                        antes de poder crear una mesa.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="restaurante_id">Restaurante</Label>
                                    <Select
                                        value={data.restaurante_id}
                                        onValueChange={(value) => setData('restaurante_id', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar restaurante" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {restaurantes.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    {r.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.restaurante_id} />
                                </div>
                            )}

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado inicial</Label>
                                <Select
                                    value={data.estado}
                                    onValueChange={(value) => setData('estado', value)}
                                    disabled={processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="disponible">Disponible</SelectItem>
                                        <SelectItem value="ocupada">Ocupada</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.estado} />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={processing || restaurantes.length === 0} className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Crear Mesa'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('mesas.index')}>Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
