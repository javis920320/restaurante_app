import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
                    title: 'text-gray-900 dark:text-gray-100 font-medium',
                    description: 'text-gray-600 dark:text-gray-400',
                    success: 'border-l-4 border-l-green-500',
                    error: 'border-l-4 border-l-red-500',
                    warning: 'border-l-4 border-l-yellow-500',
                    info: 'border-l-4 border-l-blue-500',
                },
            }}
            richColors
        />
    );
}
