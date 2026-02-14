import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { CarritoProvider } from '../../context/CarritoContext';
import { MenuData } from '../../services/menuService';
import CategorySection from '../../components/MenuQR/CategorySection';
import CarritoSidebar from '../../components/MenuQR/CarritoSidebar';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface MenuQRShowProps {
    mesa: {
        id: number;
        nombre: string;
        qr_token: string;
    };
    restaurante: {
        nombre: string;
        direccion: string;
    };
    menu: Array<{
        id: number;
        nombre: string;
        productos: Array<{
            id: number;
            nombre: string;
            descripcion: string;
            precio: number;
            imagen?: string;
            activo: boolean;
            categoria_id: number;
        }>;
    }>;
}

export default function Show({ mesa, restaurante, menu }: MenuQRShowProps) {
    const [carritoAbierto, setCarritoAbierto] = useState(false);

    return (
        <CarritoProvider>
            <Head title={`Menú - ${restaurante.nombre}`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {restaurante.nombre}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Mesa: {mesa.nombre}
                                </p>
                            </div>
                            
                            {/* Botón para abrir carrito en móvil */}
                            <Button
                                onClick={() => setCarritoAbierto(true)}
                                className="lg:hidden"
                                size="lg"
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Menú de productos */}
                        <div className="flex-1">
                            {menu.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        No hay productos disponibles en este momento.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {menu.map((categoria) => (
                                        <CategorySection
                                            key={categoria.id}
                                            categoria={categoria}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar del carrito - Desktop */}
                        <div className="hidden lg:block lg:w-96">
                            <div className="sticky top-24">
                                <CarritoSidebar 
                                    qrToken={mesa.qr_token}
                                    showAsModal={false}
                                />
                            </div>
                        </div>

                        {/* Modal del carrito - Mobile */}
                        {carritoAbierto && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
                                <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl">
                                    <CarritoSidebar
                                        qrToken={mesa.qr_token}
                                        showAsModal={true}
                                        onClose={() => setCarritoAbierto(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CarritoProvider>
    );
}
