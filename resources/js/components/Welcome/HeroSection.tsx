import { ChevronDown, Clock } from 'lucide-react';

export default function HeroSection() {
    const scrollToExperience = () => {
        const element = document.getElementById('experiencia');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
                <img src="/images/hero-burger.jpg" alt="Hamburguesa artesanal con queso fundido" className="h-full w-full object-cover" />
                {/* Dark gradients to fade the image edges */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/85 via-[#0A0A0A]/60 to-[#0A0A0A]" />
            </div>

            {/* Ember particles */}
            <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-float-up absolute h-1.5 w-1.5 rounded-full bg-[#C20000]"
                        style={{
                            left: `${15 + i * 10}%`,
                            bottom: `${5 + (i % 3) * 10}%`,
                            animationDelay: `${i * 0.6}s`,
                            animationDuration: `${3 + (i % 3)}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-20 mt-16 flex flex-col items-center gap-6 px-4 text-center">
                <img
                    src="/images/kadena_barra_sin_fondo.png"
                    alt="Kadena Barra y Fogón logo"
                    className="h-32 w-32 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] md:h-40 md:w-40"
                />

                <div className="space-y-1">
                    <h1 className="font-display text-6xl font-bold tracking-tight text-[#C20000] drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] md:text-8xl lg:text-9xl">
                        KADENA
                    </h1>
                    <p className="font-display text-xl font-medium tracking-widest text-zinc-100 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl lg:text-3xl">
                        Barra y Fogón
                    </p>
                </div>

                <p className="max-w-md text-lg leading-relaxed font-light text-zinc-300 italic md:text-xl">
                    "No dejes para mañana lo que te puedes comer hoy."
                </p>

                <div className="flex items-center gap-2 rounded-full border border-[#C20000]/40 bg-[#C20000]/10 px-5 py-2.5 backdrop-blur-sm">
                    <Clock className="h-5 w-5 text-[#C20000]" />
                    <span className="font-display text-lg font-semibold tracking-wide text-zinc-100">6 PM &ndash; 12 AM</span>
                </div>

                <a
                    href="https://wa.me/573117935498"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display animate-glow-red mt-2 inline-flex items-center gap-2 rounded-lg bg-[#C20000] px-8 py-4 text-lg font-bold tracking-wider text-white uppercase transition-all duration-200 hover:scale-105 hover:brightness-115"
                >
                    Pide Aquí
                </a>

                <button
                    onClick={scrollToExperience}
                    className="mt-8 animate-bounce cursor-pointer border-0 bg-transparent text-zinc-500 transition-colors hover:text-zinc-100"
                    aria-label="Desplazarse hacia abajo"
                >
                    <ChevronDown className="h-8 w-8" />
                </button>
            </div>
        </section>
    );
}
