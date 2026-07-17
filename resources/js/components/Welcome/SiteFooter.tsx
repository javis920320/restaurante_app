function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function TiktokIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    );
}

const socialLinks = [
    { icon: InstagramIcon, href: '#', label: 'Instagram' },
    { icon: FacebookIcon, href: '#', label: 'Facebook' },
    { icon: TiktokIcon, href: '#', label: 'TikTok' },
];

export default function SiteFooter() {
    return (
        <footer className="border-t border-zinc-900 bg-[#0B0B0B] py-12">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex flex-col items-center gap-6">
                    <img
                        src="/images/kadena_barra_sin_fondo.png"
                        alt="Kadena Barra y Fogón logo"
                        className="w-20 h-20 object-contain"
                    />
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-all duration-200 hover:border-[#C20000] hover:text-[#C20000]"
                                aria-label={social.label}
                            >
                                <social.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>

                    <div className="text-center text-sm font-light">
                        <p className="font-display font-medium tracking-wide text-zinc-400">Kadena &ndash; Barra y Fogón</p>
                        <p className="mt-1 text-xs text-zinc-500">Entrada La Laguna &middot; 6 PM &ndash; 12 AM</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
