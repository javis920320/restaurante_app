import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="group/logo flex w-full cursor-pointer items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 shadow-md transition-all duration-500 group-hover/logo:border-red-500/50 group-hover/logo:shadow-[0_0_10px_rgba(194,0,0,0.4)]">
                <AppLogoIcon className="size-6 transition-transform duration-700 group-hover/logo:scale-110 group-hover/logo:rotate-[360deg]" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="font-display truncate font-semibold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">Kadena</span>
                <span className="font-display truncate text-xs font-light text-zinc-500 dark:text-zinc-400">Barra y Fogón</span>
            </div>
        </div>
    );
}
