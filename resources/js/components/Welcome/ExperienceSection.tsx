import { Beef, Flame, Wine } from 'lucide-react';

const features = [
    {
        icon: Flame,
        title: 'Parrilla',
        description: 'Fuego vivo, cortes selectos y el sabor auténtico del carbón.',
    },
    {
        icon: Beef,
        title: 'Hamburguesas Artesanales',
        description: 'Carne premium, ingredientes frescos, preparadas al momento.',
    },
    {
        icon: Wine,
        title: 'Barra y Coctelería',
        description: 'Cócteles de autor, cervezas artesanales y el mejor ambiente.',
    },
];

export default function ExperienceSection() {
    return (
        <section id="experiencia" className="relative overflow-hidden bg-[#0A0A0A] py-24 md:py-32">
            {/* Subtle texture overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4">
                <div className="mb-16 text-center">
                    <h2 className="font-display text-4xl font-bold tracking-wide text-zinc-100 uppercase md:text-5xl lg:text-6xl">
                        Nuestra Experiencia
                    </h2>
                    <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#C20000]" />
                    <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed font-light text-zinc-400 md:text-xl">
                        Donde el fuego se convierte en sabor.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group flex flex-col items-center gap-4 rounded-xl border border-zinc-800/80 bg-[#121212] p-8 text-center transition-all duration-300 hover:border-[#C20000]/50 hover:shadow-[0_0_30px_rgba(194,0,0,0.12)]"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C20000]/10 text-[#C20000] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C20000]/20">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="font-display mt-2 text-2xl font-bold tracking-wide text-zinc-100">{feature.title}</h3>
                            <p className="mt-1 leading-relaxed font-light text-zinc-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
