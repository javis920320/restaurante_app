import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePedido } from '@/context/PedidoContext';
import { useCategorys } from '@/hooks/use-categorys';
import { Plato } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
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
        precio: plato.precio, // Incluye el precio del plato
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
            <Card className="w-full h-64 rounded-lg  relative">
                
                <CardTitle >
                    <img
                        src={plato.imagen? plato.imagen : 'https://img.freepik.com/free-vector/404-error-with-landscape-concept-illustration_114360-7898.jpg'}
                        alt={plato.nombre}
                        className="w-full h-20 object-cover rounded-t-lg"
                    />
                </CardTitle>

                <CardContent className="">
                    <h2 className="text-start text-blue-950 dark:text-gray-300 font-bold">{plato.nombre}</h2>
                    <section className="flex flex-col  justify-start items-start   ">
                        <small className=' m-2 text-gray-400'>{plato.descripcion}</small>
                        
                    </section>
                </CardContent>

                <CardFooter className='flex flex-row justify-between items-center'> 
                    <Button type='submit' className='cursor-pointer' > <ShoppingCart></ShoppingCart>+</Button>
                    <small className='   font-semibold  text-green-200 opacity-55 bg-green-600 rounded-lg p-2'>${plato.precio.toFixed(2)}</small>
                </CardFooter>
            </Card>
        </form>
    );
};

export default PlatosDisponibles;