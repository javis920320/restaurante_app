import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <div
            className={`flex items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 p-0.5 shadow-sm ${className || ''}`}
        >
            <img src="/images/kadena_barra_sin_fondo.png" alt="Kadena Logo" className="h-full w-full object-contain" {...props} />
        </div>
    );
}
