import AppLayout from '@/layouts/app-layout'
import { Mesa } from '@/types'
import React from 'react'
import PlatosDisponibles from './PlatosDisponibles';
import PedidoMesero from './PedidoMesero';
import { Head } from '@inertiajs/react';


interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    estado: string;
}

interface PrincipalProps {
    mesa: Mesa;
    platos: Plato[];
}

const Principal: React.FC<PrincipalProps> = ({ mesa, platos }) => {
    const [listofpedidos, setListPedidos] = React.useState([]);


    return (
        <AppLayout>
            <Head title="Crear Pedido" />
            <h1 className='text-2xl font-bold'>{mesa.nombre}</h1>
            <p className='text-gray-500'>Crear Pedido</p>
            <div className='grid grid-cols-2 gap-3 m-4'>    
            
            <section className=''>
                
                <div className='grid grid-cols-1 xl:grid-cols-3  lg:grid-cols-2 md:grid-cols-1 gap-5 '>
                    {platos.length == 0 && <p className='text-red-500'>No hay platos disponibles</p>}
                    {Array.isArray(platos) && platos.map((plato: any) => (
                        <PlatosDisponibles key={plato.id} plato={plato} />
                    ))}

                </div>


            </section>
            <section className=''>

                <PedidoMesero />
            </section>
            </div>
        </AppLayout>
    )
}

export default Principal