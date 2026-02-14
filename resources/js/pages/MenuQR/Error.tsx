import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface MenuQRErrorProps {
    error: string;
}

export default function Error({ error }: MenuQRErrorProps) {
    return (
        <>
            <Head title="Error - Mesa no válida" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Mesa no válida
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        {error || 'El código QR que has escaneado no es válido o ha expirado.'}
                    </p>
                    
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                            Por favor, verifica que estás escaneando el código QR correcto de tu mesa.
                        </p>
                        
                        <Button asChild className="w-full">
                            <Link href="/">
                                Volver al inicio
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
