import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FloatingHeaderProps {
    auth: {
        user?: any;
    };
}

export default function FloatingHeader({ auth }: FloatingHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setIsOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                isScrolled ? 'border-b border-zinc-800/60 bg-[#0B0B0B]/85 py-4 shadow-lg backdrop-blur-md' : 'bg-transparent py-6'
            }`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
                {/* Logo / Title */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
                >
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#C20000]/30 bg-black/40 shadow-[0_0_10px_rgba(194,0,0,0.2)] transition-all duration-300 group-hover:border-[#C20000]/80 group-hover:shadow-[0_0_15px_rgba(194,0,0,0.5)]">
                        <img
                            src="/images/kadena_barra_sin_fondo.png"
                            alt="Kadena Logo"
                            className="h-8 w-8 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                        />
                        {/* Subtle inner glow backdrop */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#C20000]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display text-2xl leading-none font-bold tracking-wider text-[#C20000] transition-colors group-hover:text-[#e60000]">
                            KADENA
                        </span>
                        <span className="font-display mt-1 hidden text-[10px] leading-none font-light tracking-[0.25em] text-zinc-400 uppercase sm:inline-block">
                            Barra y Fogón
                        </span>
                    </div>
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    <button
                        onClick={() => scrollToSection('experiencia')}
                        className="cursor-pointer border-0 bg-transparent text-sm font-medium tracking-wide text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Experiencia
                    </button>
                    <button
                        onClick={() => scrollToSection('menu')}
                        className="cursor-pointer border-0 bg-transparent text-sm font-medium tracking-wide text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Menú
                    </button>
                    <button
                        onClick={() => scrollToSection('ubicacion')}
                        className="cursor-pointer border-0 bg-transparent text-sm font-medium tracking-wide text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Ubicación
                    </button>
                </nav>

                {/* Auth Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-lg border border-[#C20000]/40 bg-[#C20000]/10 px-5 py-2 text-sm font-medium tracking-wide text-zinc-100 transition-all hover:bg-[#C20000] hover:text-white"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                                Iniciar Sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-lg bg-[#C20000] px-5 py-2 text-sm font-bold tracking-wider text-white uppercase transition-all hover:bg-[#d90000] hover:shadow-[0_0_15px_rgba(194,0,0,0.4)]"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer border-0 bg-transparent text-zinc-300 hover:text-zinc-100 focus:outline-none md:hidden"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {isOpen && (
                <div className="animate-accordion-down absolute top-full right-0 left-0 flex flex-col gap-6 border-b border-zinc-800/80 bg-[#0B0B0B]/95 px-6 py-8 shadow-2xl backdrop-blur-lg md:hidden">
                    <button
                        onClick={() => scrollToSection('experiencia')}
                        className="cursor-pointer border-0 bg-transparent text-left text-lg font-medium text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Experiencia
                    </button>
                    <button
                        onClick={() => scrollToSection('menu')}
                        className="cursor-pointer border-0 bg-transparent text-left text-lg font-medium text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Menú
                    </button>
                    <button
                        onClick={() => scrollToSection('ubicacion')}
                        className="cursor-pointer border-0 bg-transparent text-left text-lg font-medium text-zinc-300 transition-colors hover:text-[#C20000]"
                    >
                        Ubicación
                    </button>
                    <div className="my-2 h-px bg-zinc-800/60" />
                    <div className="flex flex-col gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg border border-[#C20000]/40 bg-[#C20000]/10 px-5 py-3 text-center text-base font-medium text-zinc-100 transition-all hover:bg-[#C20000] hover:text-white"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="py-2 text-center text-zinc-400 transition-colors hover:text-zinc-100">
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-[#C20000] px-5 py-3 text-center text-base font-bold tracking-wider text-white uppercase transition-all hover:bg-[#d90000]"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
