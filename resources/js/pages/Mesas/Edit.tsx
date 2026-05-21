import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { BreadcrumbItem, type Mesa } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Table } from 'lucide-react';
import React from 'react';
import FormularioMesa from './FormularioMesa';

interface Restaurante {
    id: number;
    nombre: string;
}

interface EditProps {
    mesa: Mesa;
    restaurantes: Restaurante[];
}

export default function Edit({ mesa, restaurantes }: EditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mesas', href: '/configuracion/mesas' },
        { title: `Editar ${mesa.nombre}`, href: `/configuracion/mesas/${mesa.id}/edit` },
    ];

    const handleSuccess = () => {
        router.visit(route('mesas.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${mesa.nombre}`} />
            <ConfiguracionLayout>
                
                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={route('mesas.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-155 flex items-center gap-2">
                            Editar {mesa.nombre} <Table className="h-5 w-5 text-indigo-500" />
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Token de mesa: <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{mesa.qr_token}</span>
                        </p>
                    </div>
                </div>

                <div className="max-w-lg">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Modificar Atributos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormularioMesa 
                                restaurantes={restaurantes} 
                                mesa={mesa}
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
