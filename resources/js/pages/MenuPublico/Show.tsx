import { type Categoria, type Menu, type Plato } from '@/types';
import { Head } from '@inertiajs/react';
import { MapPin, Phone, Utensils } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    menu: Menu & {
        categorias: (Categoria & { platos: Plato[] })[];
    };
}

export default function MenuPublicoShow({ menu }: Props) {
    const categorias = menu.categorias ?? [];
    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    const activeCategorias = categorias.filter((c) => c.activo !== false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToCategory = (id: number | null) => {
        setActiveTab(id);
        if (id === null) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const el = document.getElementById(`cat-${id}`);
        if (el) {
            const offset = navRef.current ? navRef.current.offsetHeight + 80 : 120;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const restaurante = menu.restaurante;

    return (
        <>
            <Head title={`${menu.nombre} - ${restaurante?.nombre ?? ''}`} />
            <div className="min-h-screen" style={{ background: '#0f0f0f', color: '#f5f0e8' }}>
                {/* ── Hero Section ── */}
                <section
                    className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden px-4 text-center"
                    style={{
                        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0a00 100%)',
                    }}
                >
                    {/* Decorative pattern overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                    />

                    {/* Amber gradient glow */}
                    <div
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                        style={{ width: 500, height: 300, background: '#d97706' }}
                    />

                    <div className="relative z-10 space-y-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-600/40 bg-amber-900/40">
                            <Utensils className="h-7 w-7 text-amber-400" />
                        </div>
                        <h1
                            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                            style={{ color: '#fef3c7', textShadow: '0 2px 20px rgba(217,119,6,0.4)' }}
                        >
                            {restaurante?.nombre ?? 'Restaurante'}
                        </h1>
                        <p className="text-lg font-light uppercase" style={{ color: '#d97706', letterSpacing: '0.3em' }}>
                            {menu.nombre}
                        </p>
                        {(restaurante?.direccion || restaurante?.telefono) && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: '#a8956a' }}>
                                {restaurante?.direccion && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-amber-600" />
                                        {restaurante.direccion}
                                    </span>
                                )}
                                {restaurante?.telefono && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-amber-600" />
                                        {restaurante.telefono}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom fade */}
                    <div
                        className="pointer-events-none absolute right-0 bottom-0 left-0 h-24"
                        style={{ background: 'linear-gradient(to bottom, transparent, #0f0f0f)' }}
                    />
                </section>

                {/* ── Sticky Category Navigation ── */}
                {activeCategorias.length > 0 && (
                    <div
                        ref={navRef}
                        className="sticky top-0 z-30 transition-all duration-300"
                        style={{
                            background: scrolled ? 'rgba(15,15,15,0.95)' : '#0f0f0f',
                            backdropFilter: 'blur(12px)',
                            borderBottom: '1px solid rgba(217,119,6,0.2)',
                            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
                        }}
                    >
                        <div className="mx-auto max-w-5xl overflow-x-auto px-4">
                            <div className="flex gap-1 py-3">
                                <button
                                    onClick={() => scrollToCategory(null)}
                                    className="rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200"
                                    style={{
                                        background: activeTab === null ? '#d97706' : 'transparent',
                                        color: activeTab === null ? '#fff' : '#a8956a',
                                        border: activeTab === null ? '1px solid #d97706' : '1px solid rgba(168,149,106,0.3)',
                                    }}
                                >
                                    Todo
                                </button>
                                {activeCategorias.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => scrollToCategory(cat.id)}
                                        className="rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200"
                                        style={{
                                            background: activeTab === cat.id ? '#d97706' : 'transparent',
                                            color: activeTab === cat.id ? '#fff' : '#a8956a',
                                            border: activeTab === cat.id ? '1px solid #d97706' : '1px solid rgba(168,149,106,0.3)',
                                        }}
                                    >
                                        {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Menu Content ── */}
                <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
                    {activeCategorias.length === 0 && (
                        <div className="py-24 text-center">
                            <Utensils className="mx-auto mb-4 h-12 w-12 opacity-20" style={{ color: '#d97706' }} />
                            <p className="text-lg" style={{ color: '#6b5a3e' }}>
                                Este menú no tiene categorías disponibles aún.
                            </p>
                        </div>
                    )}

                    {activeCategorias
                        .filter((cat) => activeTab === null || cat.id === activeTab)
                        .map((categoria) => {
                            const platosActivos = (categoria.platos ?? []).filter((p) => p.activo);
                            if (platosActivos.length === 0) return null;

                            return (
                                <section key={categoria.id} id={`cat-${categoria.id}`}>
                                    {/* Category heading */}
                                    <div className="mb-6 flex items-center gap-4">
                                        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: '#fef3c7' }}>
                                            {categoria.nombre}
                                        </h2>
                                        <div
                                            className="h-px flex-1"
                                            style={{ background: 'linear-gradient(to right, rgba(217,119,6,0.5), transparent)' }}
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {platosActivos.map((plato) => (
                                            <PlatoCard key={plato.id} plato={plato} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                </main>

                {/* ── Footer ── */}
                <footer
                    className="mt-16 py-10 text-center text-sm"
                    style={{
                        borderTop: '1px solid rgba(217,119,6,0.2)',
                        background: '#0a0a0a',
                        color: '#6b5a3e',
                    }}
                >
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4">
                        <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-amber-700" />
                            <span className="font-medium" style={{ color: '#a8956a' }}>
                                {restaurante?.nombre}
                            </span>
                        </div>
                        <p>Menú digital · {menu.nombre}</p>
                        {restaurante?.direccion && <p>{restaurante.direccion}</p>}
                        {restaurante?.telefono && <p>{restaurante.telefono}</p>}
                    </div>
                </footer>
            </div>
        </>
    );
}

function PlatoCard({ plato }: { plato: Plato }) {
    const agotado = plato.stock !== null && plato.stock !== undefined && plato.stock === 0;

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${agotado ? 'opacity-60' : ''}`}
            style={{
                background: 'linear-gradient(145deg, #1c1209, #150e06)',
                border: '1px solid rgba(217,119,6,0.15)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            {/* Image */}
            {plato.imagen ? (
                <div className="relative h-44 overflow-hidden">
                    <img
                        src={plato.imagen}
                        alt={plato.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, transparent 50%, #1c1209 100%)' }}
                    />
                    {agotado && (
                        <div
                            className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}
                        >
                            Agotado
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex h-32 items-center justify-center" style={{ background: 'rgba(217,119,6,0.05)' }}>
                    <Utensils className="h-8 w-8 opacity-20" style={{ color: '#d97706' }} />
                    {agotado && (
                        <div
                            className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}
                        >
                            Agotado
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-semibold leading-tight" style={{ color: '#fef3c7' }}>
                    {plato.nombre}
                </h3>
                {plato.descripcion && (
                    <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: '#8a7455' }}>
                        {plato.descripcion}
                    </p>
                )}
                <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(217,119,6,0.1)' }}>
                    <span className="text-lg font-bold" style={{ color: '#d97706' }}>
                        ${Number(plato.precio).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
