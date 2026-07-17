import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Table } from 'lucide-react';
import FormularioMesa from './FormularioMesa';

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
    const handleSuccess = () => {
        router.visit(route('mesas.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Mesa" />
            <ConfiguracionLayout>
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={route('mesas.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="dark:text-gray-155 flex items-center gap-2 text-2xl font-bold text-gray-900">
                            Registrar Mesa <Table className="h-5 w-5 text-indigo-500" />
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Se generará un código QR único para que tus clientes comiencen a pedir.
                        </p>
                    </div>
                </div>

                <div className="max-w-lg">
                    <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Datos Generales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormularioMesa
                                restaurantes={restaurantes}
                                onSuccess={handleSuccess}
                                onCancel={() => router.visit(route('mesas.index'))}
                            />
                        </CardContent>
                    </Card>
                </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
