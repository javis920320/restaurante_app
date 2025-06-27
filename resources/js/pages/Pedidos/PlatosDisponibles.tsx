import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePedido } from '@/context/PedidoContext';
import { useCategorys } from '@/hooks/use-categorys';
import { Plato } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Clock, ShoppingCart } from 'lucide-react';
import React from 'react';

interface PlatosDisponiblesProps {
    plato: Plato;
}

const PlatosDisponibles = ({ plato }: PlatosDisponiblesProps) => {
    // Obtén la mesa desde el contexto de la página actual
    const { mesa } = usePage().props;
    const { agregarPedido } = usePedido();



    // Manejo del formulario
    const { data, setData } = useForm({
        cantidad: 0,
        mesa_id: mesa.id, // Asegúrate de que mesa tenga un id válido
        plato_id: plato.id,
        precio: plato.precio, 
       // Incluye el precio del plato
    });

    // Manejo del envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        agregarPedido({
            plato_id: data.plato_id,
            plato: plato,
            cantidad: data.cantidad,

            precio: data.precio,
        });


    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">

                <CardTitle className='relative'>
                    <img
                        src={plato.imagen ? plato.imagen : '/images/placeholder.svg'}
                        alt={plato.nombre}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className='absolute top-2 right-0 text-[14px] bg-white p-2 rounded-4xl text-gray-700'> <Clock className='w-3 h-3 inline mr-1'/>{plato.duration?"10 min":"10 min"}</div>
                </CardTitle>

                <CardContent className="">
                    <div className='flex justify-between items-center text-2xl'>
                        <h2 className="text-start text-blue-950 dark:text-gray-300 font-bold">{plato.nombre}</h2>
                        <small className='font-extrabold  text-green-500 opacity-55 rounded-lg p-2'>${plato.precio.toFixed(2)}</small>
                    </div>

                    <section className="flex flex-col  justify-start items-start   ">
                        <small className=' m-2 text-gray-400'>{plato.descripcion}</small>

                    </section>
                </CardContent>

                <CardFooter className='flex flex-row justify-between items-center'>
                    <Button type='submit' className='cursor-pointer w-full' > <ShoppingCart></ShoppingCart>+</Button>
                    
                </CardFooter>
            </Card>
        </form>
    );
};

export default PlatosDisponibles;