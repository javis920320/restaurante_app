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
            <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#f5f0e8' }}>
                {/* ── Hero Section ── */}
                <section
                    className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden px-4 text-center"
                    style={{
                        background: 'linear-gradient(135deg, #0A0A0A 0%, #2d0000 50%, #0A0A0A 100%)',
                    }}
                >
                    {/* Decorative pattern overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C20000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                    />

                    {/* Red gradient glow */}
                    <div
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                        style={{ width: 500, height: 300, background: '#C20000' }}
                    />

                    <div className="relative z-10 space-y-4">
                        <div className="animate-ember-pulse group mx-auto mb-4 flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#C20000]/50 bg-black/60 shadow-[0_0_20px_rgba(194,0,0,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
                            <img
                                src="/images/kadena_barra_sin_fondo.png"
                                alt="Kadena Barra y Fogón logo"
                                className="h-20 w-20 object-contain transition-transform duration-500 hover:rotate-6"
                            />
                        </div>
                        <h1
                            className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                            style={{ textShadow: '0 2px 20px rgba(194,0,0,0.5)' }}
                        >
                            {restaurante?.nombre ?? 'Restaurante'}
                        </h1>
                        <p className="font-display text-lg font-light text-[#C20000] uppercase" style={{ letterSpacing: '0.3em' }}>
                            {menu.nombre}
                        </p>
                        {(restaurante?.direccion || restaurante?.telefono) && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
                                {restaurante?.direccion && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-[#C20000]" />
                                        {restaurante.direccion}
                                    </span>
                                )}
                                {restaurante?.telefono && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-[#C20000]" />
                                        {restaurante.telefono}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom fade */}
                    <div
                        className="pointer-events-none absolute right-0 bottom-0 left-0 h-24"
                        style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }}
                    />
                </section>

                {/* ── Sticky Category Navigation ── */}
                {activeCategorias.length > 0 && (
                    <div
                        ref={navRef}
                        className="sticky top-0 z-30 transition-all duration-300"
                        style={{
                            background: scrolled ? 'rgba(10,10,10,0.95)' : '#0A0A0A',
                            backdropFilter: 'blur(12px)',
                            borderBottom: '1px solid rgba(194,0,0,0.2)',
                            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
                        }}
                    >
                        <div className="mx-auto max-w-5xl overflow-x-auto px-4">
                            <div className="flex gap-1 py-3">
                                <button
                                    onClick={() => scrollToCategory(null)}
                                    className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200"
                                    style={{
                                        background: activeTab === null ? '#C20000' : 'transparent',
                                        color: activeTab === null ? '#fff' : '#a1a1aa',
                                        border: activeTab === null ? '1px solid #C20000' : '1px solid rgba(161,161,170,0.3)',
                                    }}
                                >
                                    Todo
                                </button>
                                {activeCategorias.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => scrollToCategory(cat.id)}
                                        className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200"
                                        style={{
                                            background: activeTab === cat.id ? '#C20000' : 'transparent',
                                            color: activeTab === cat.id ? '#fff' : '#a1a1aa',
                                            border: activeTab === cat.id ? '1px solid #C20000' : '1px solid rgba(161,161,170,0.3)',
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
                            <Utensils className="mx-auto mb-4 h-12 w-12 text-[#C20000] opacity-20" />
                            <p className="text-lg text-zinc-500">Este menú no tiene categorías disponibles aún.</p>
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
                                        <h2 className="font-display text-2xl font-bold tracking-wider text-zinc-100 uppercase">{categoria.nombre}</h2>
                                        <div
                                            className="h-px flex-1"
                                            style={{ background: 'linear-gradient(to right, rgba(194,0,0,0.5), transparent)' }}
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
                        borderTop: '1px solid rgba(194,0,0,0.2)',
                        background: '#0B0B0B',
                        color: '#71717a',
                    }}
                >
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4">
                        <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-[#C20000]" />
                            <span className="font-medium text-zinc-300">{restaurante?.nombre}</span>
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
                background: 'linear-gradient(145deg, #121212, #0A0A0A)',
                border: '1px solid rgba(194,0,0,0.15)',
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
                        style={{ background: 'linear-gradient(to bottom, transparent 50%, #121212 100%)' }}
                    />

                    {/* Steam overlay when not sold out */}
                    {!agotado && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute bottom-3 left-1/4 w-6 bg-gradient-to-t from-white/25 via-white/5 to-transparent h-16 rounded-full blur-md animate-steam" style={{ animationDelay: '0s', animationDuration: '3.5s' }} />
                            <div className="absolute bottom-1 left-1/2 w-8 bg-gradient-to-t from-white/20 via-white/5 to-transparent h-20 rounded-full blur-md animate-steam" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
                            <div className="absolute bottom-2 left-2/3 w-7 bg-gradient-to-t from-white/25 via-white/5 to-transparent h-18 rounded-full blur-md animate-steam" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                        </div>
                    )}

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
                <div className="relative flex h-32 items-center justify-center bg-zinc-900/30 overflow-hidden">
                    <Utensils className="h-8 w-8 text-[#C20000] opacity-25" />

                    {/* Steam overlay when not sold out */}
                    {!agotado && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute bottom-2 left-1/3 w-6 bg-gradient-to-t from-white/20 via-white/5 to-transparent h-16 rounded-full blur-md animate-steam" style={{ animationDelay: '0s', animationDuration: '3.5s' }} />
                            <div className="absolute bottom-3 left-2/3 w-6 bg-gradient-to-t from-white/20 via-white/5 to-transparent h-16 rounded-full blur-md animate-steam" style={{ animationDelay: '1.2s', animationDuration: '4s' }} />
                        </div>
                    )}
                    
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
                <h3 className="font-display text-lg leading-tight font-bold text-zinc-100">{plato.nombre}</h3>
                {plato.descripcion && <p className="line-clamp-2 text-sm leading-relaxed font-light text-zinc-400">{plato.descripcion}</p>}
                <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(194,0,0,0.1)' }}>
                    <span className="text-lg font-bold text-[#C20000]">${Number(plato.precio).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
