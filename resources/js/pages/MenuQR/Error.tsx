import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface MenuQRErrorProps {
    error: string;
}

export default function Error({ error }: MenuQRErrorProps) {
    return (
        <>
            <Head title="Error - Mesa no válida" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        </div>
                    </div>

                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Mesa no válida</h1>

                    <p className="mb-6 text-gray-600">{error || 'El código QR que has escaneado no es válido o ha expirado.'}</p>

                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">Por favor, verifica que estás escaneando el código QR correcto de tu mesa.</p>

                        <Button asChild className="w-full">
                            <Link href="/">Volver al inicio</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
