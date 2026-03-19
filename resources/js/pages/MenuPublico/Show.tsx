import { type Categoria, type Menu, type Plato } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    menu: Menu & {
        categorias: (Categoria & { platos: Plato[] })[];
    };
}

export default function MenuPublicoShow({ menu }: Props) {
    const categorias = menu.categorias ?? [];
    const [activeTab, setActiveTab] = useState<number | null>(categorias[0]?.id ?? null);

    const activeCategorias = categorias.filter((c) => c.activo !== false);

    return (
        <>
            <Head title={`${menu.nombre} - ${menu.restaurante?.nombre ?? ''}`} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-2xl px-4 py-6">
                        <h1 className="text-2xl font-bold text-gray-900">{menu.restaurante?.nombre}</h1>
                        <p className="mt-1 text-gray-500">{menu.nombre}</p>
                    </div>
                </header>

                {/* Category tabs */}
                {activeCategorias.length > 0 && (
                    <div className="sticky top-0 z-10 bg-white shadow-sm">
                        <div className="mx-auto max-w-2xl overflow-x-auto px-4">
                            <div className="flex gap-1 py-3">
                                <button
                                    onClick={() => setActiveTab(null)}
                                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                        activeTab === null
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Todo
                                </button>
                                {activeCategorias.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id)}
                                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                            activeTab === cat.id
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu content */}
                <main className="mx-auto max-w-2xl space-y-8 px-4 py-6">
                    {activeCategorias.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-lg">Este menú no tiene categorías disponibles aún.</p>
                        </div>
                    )}

                    {activeCategorias
                        .filter((cat) => activeTab === null || cat.id === activeTab)
                        .map((categoria) => {
                            const platosActivos = (categoria.platos ?? []).filter((p) => p.activo);
                            if (platosActivos.length === 0) return null;

                            return (
                                <section key={categoria.id} id={`cat-${categoria.id}`}>
                                    <h2 className="mb-4 text-xl font-semibold text-gray-800 border-b pb-2">
                                        {categoria.nombre}
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {platosActivos.map((plato) => (
                                            <PlatoCard key={plato.id} plato={plato} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                </main>

                {/* Footer */}
                <footer className="border-t bg-white mt-8 py-6 text-center text-sm text-gray-400">
                    <p>Menú digital · {menu.restaurante?.nombre}</p>
                </footer>
            </div>
        </>
    );
}

function PlatoCard({ plato }: { plato: Plato }) {
    const agotado = plato.stock !== null && plato.stock !== undefined && plato.stock === 0;

    return (
        <div className={`flex gap-3 rounded-xl bg-white p-4 shadow-sm ${agotado ? 'opacity-60' : ''}`}>
            {plato.imagen && (
                <img
                    src={plato.imagen}
                    alt={plato.nombre}
                    loading="lazy"
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
            )}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 leading-tight">{plato.nombre}</h3>
                    {agotado && (
                        <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                            Agotado
                        </span>
                    )}
                </div>
                {plato.descripcion && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{plato.descripcion}</p>
                )}
                <p className="mt-2 font-semibold text-gray-900">${Number(plato.precio).toFixed(2)}</p>
            </div>
        </div>
    );
}
