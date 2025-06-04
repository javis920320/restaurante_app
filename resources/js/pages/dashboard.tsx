import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Mesa, type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import DrawedMesa from "../pages/Mesas/DrawedMesa";
import { Head, Link } from '@inertiajs/react';
import { Car } from 'lucide-react';
import CardMesa from './Mesas/CardMesa';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({mesas}: { mesas: Mesa[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 ">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                  
                    <Link href={route('pedido.cocina')} className="text-center">
                        <Button className="w-full bg-amber-300 hover:bg-amber-400">
                            Ver Pedidos
                        </Button>
                    </Link>
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min flex flex-col justify-center items-center gap-2">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> 

                <h1>Estado de las Mesas </h1>
                

                <div className='grid gap-2  grid-cols-1 md:grid-cols-4 sm:grid-cols-1 relative content-center  justify-center  w-full'>
                    
                    
                    {Array.isArray(mesas) && mesas.map((mesa) => (
                       <CardMesa key={mesa.id} mesa={mesa}  />  

                    ))}

                   
                   

                </div>
                
                </div>
            </div>
        </AppLayout>
    );
}
