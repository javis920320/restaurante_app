import { MapPin, MessageCircle, Phone } from 'lucide-react';

export default function LocationSection() {
    return (
        <section id="ubicacion" className="relative overflow-hidden bg-[#0A0A0A] py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-16 text-center">
                    <h2 className="font-display text-4xl font-bold tracking-wide text-zinc-100 uppercase md:text-5xl lg:text-6xl">Encuéntranos</h2>
                    <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#C20000]" />
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">
                    {/* Info */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C20000]/20 bg-[#C20000]/10">
                                <MapPin className="h-6 w-6 text-[#C20000]" />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-bold tracking-wide text-zinc-100">Dirección</h3>
                                <p className="mt-1 leading-relaxed font-light text-zinc-400">Entrada La Laguna</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C20000]/20 bg-[#C20000]/10">
                                <Phone className="h-6 w-6 text-[#C20000]" />
                            </div>
                            <div>
                                <h3 className="font-display text-xl font-bold tracking-wide text-zinc-100">Teléfonos</h3>
                                <div className="mt-1 flex flex-col gap-1 font-light">
                                    <a href="tel:+573117935498" className="text-zinc-400 transition-colors duration-200 hover:text-[#C20000]">
                                        311 793 5498
                                    </a>
                                    <a href="tel:+573107329486" className="text-zinc-400 transition-colors duration-200 hover:text-[#C20000]">
                                        310 732 9486
                                    </a>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/573117935498"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display mt-2 inline-flex w-fit items-center gap-3 rounded-lg bg-[#25D366] px-6 py-3 text-base font-semibold tracking-wider text-neutral-900 uppercase shadow-lg transition-all duration-200 hover:shadow-[#25D366]/20 hover:brightness-110"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Escríbenos por WhatsApp
                        </a>
                    </div>

                    {/* Map - dark themed */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                        <iframe
                            title="Ubicación Kadena Barra y Fogón"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.0!2d-75.5!3d6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMDAuMCJOIDc1wrAzMCcwMC4wIlc!5e0!3m2!1ses!2sco!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
