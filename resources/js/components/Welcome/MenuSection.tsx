import { Link } from '@inertiajs/react';

const menuItems = [
    {
        name: 'Hamburguesa Kadena',
        description: 'Doble carne smash, queso cheddar fundido, bacon crocante, salsa especial de la casa.',
        image: '/images/hero-burger.jpg',
    },
    {
        name: 'Alitas en Brasa',
        description: 'Alitas marinadas al carbón con salsa BBQ ahumada y acompañamiento.',
        image: '/images/wings.jpg',
    },
    {
        name: 'Papas Cargadas',
        description: 'Papas rústicas con queso fundido, tocineta, cebolla caramelizada y salsas.',
        image: '/images/loaded-fries.jpg',
    },
    {
        name: 'Cócteles de Autor',
        description: 'Mezclas exclusivas con licores premium, frutas frescas y presentación única.',
        image: '/images/cocktails.jpg',
    },
];

interface MenuSectionProps {
    menuSlug?: string | null;
}

export default function MenuSection({ menuSlug }: MenuSectionProps) {
    return (
        <section id="menu" className="relative overflow-hidden bg-[#121212] py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-16 text-center">
                    <h2 className="font-display text-4xl font-bold tracking-wide text-zinc-100 uppercase md:text-5xl lg:text-6xl">Menú Destacado</h2>
                    <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#C20000]" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.name}
                            className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0B0B0B] transition-all duration-300 hover:border-[#C20000]/60 hover:shadow-[0_0_30px_rgba(194,0,0,0.15)]"
                        >
                            <div className="relative aspect-square overflow-hidden bg-zinc-900">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/20 to-transparent" />

                                {/* Rising Steam/Vapor effect on hover */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute bottom-4 left-1/4 w-8 bg-gradient-to-t from-white/25 via-white/5 to-transparent h-20 rounded-full blur-md animate-steam" style={{ animationDelay: '0s', animationDuration: '3.5s' }} />
                                    <div className="absolute bottom-2 left-1/2 w-12 bg-gradient-to-t from-white/20 via-white/5 to-transparent h-28 rounded-full blur-lg animate-steam" style={{ animationDelay: '0.6s', animationDuration: '4.5s' }} />
                                    <div className="absolute bottom-3 left-2/3 w-10 bg-gradient-to-t from-white/25 via-white/5 to-transparent h-24 rounded-full blur-md animate-steam" style={{ animationDelay: '1.2s', animationDuration: '4s' }} />
                                </div>
                            </div>
                            <div className="relative -mt-12 p-5">
                                <h3 className="font-display text-xl font-bold tracking-wide text-zinc-100">{item.name}</h3>
                                <p className="mt-2 text-sm leading-relaxed font-light text-zinc-400">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    {menuSlug ? (
                        <Link
                            href={`/menu-publico/${menuSlug}`}
                            className="font-display inline-flex items-center gap-2 rounded-lg border-2 border-[#C20000] bg-transparent px-8 py-3 text-base font-semibold tracking-wider text-[#C20000] uppercase transition-all duration-200 hover:bg-[#C20000] hover:text-white"
                        >
                            Ver Menú Completo
                        </Link>
                    ) : (
                        <a
                            href="https://wa.me/573117935498?text=Hola%2C%20quiero%20ver%20el%20men%C3%BA%20completo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display inline-flex items-center gap-2 rounded-lg border-2 border-[#C20000] bg-transparent px-8 py-3 text-base font-semibold tracking-wider text-[#C20000] uppercase transition-all duration-200 hover:bg-[#C20000] hover:text-white"
                        >
                            Ver Menú Completo
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
