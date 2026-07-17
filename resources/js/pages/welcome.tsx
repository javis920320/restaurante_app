import ExperienceSection from '@/components/Welcome/ExperienceSection';
import FloatingHeader from '@/components/Welcome/FloatingHeader';
import HeroSection from '@/components/Welcome/HeroSection';
import LocationSection from '@/components/Welcome/LocationSection';
import MenuSection from '@/components/Welcome/MenuSection';
import SiteFooter from '@/components/Welcome/SiteFooter';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface WelcomeProps {
    menuSlug?: string | null;
}

export default function Welcome({ menuSlug }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-zinc-100 antialiased selection:bg-[#C20000] selection:text-white">
            <Head title="KADENA - Barra y Fogón">
                <meta
                    name="description"
                    content="No dejes para mañana lo que te puedes comer hoy. Hamburguesas artesanales, parrilla y coctelería en Entrada La Laguna."
                />
                <meta name="theme-color" content="#0B0B0B" />
            </Head>

            {/* Floating Navigation Header */}
            <FloatingHeader auth={auth} />

            {/* Page Sections */}
            <main>
                {/* Hero Section */}
                <HeroSection />

                {/* Experience / Features Section */}
                <ExperienceSection />

                {/* Featured Menu Items Section */}
                <MenuSection menuSlug={menuSlug} />

                {/* Location / Map Section */}
                <LocationSection />
            </main>

            {/* Site Footer */}
            <SiteFooter />
        </div>
    );
}
