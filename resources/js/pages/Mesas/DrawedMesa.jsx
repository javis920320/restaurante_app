import { Link } from '@inertiajs/react';
import { CoffeeIcon } from 'lucide-react';
import React from 'react';

const DrawedMesa = ({ mesa }) => {
    const handleCrearPedido = () => {
        // Aquí puedes agregar la lógica para crear un pedido
        console.log(`Creando pedido para la mesa ${mesa.id}`);


    };
    //estados disponible, ocupado, reservado
    // Cambia el color de fondo según el estado de la mesa  

     const backgroundColor = mesa.estado === 'disponible' ? 'bg-green-200 border-solid border-green-300 dark:bg-gray-900  text-white w-[320px] h-[200px] rounded-lg flex flex-col justify-between ' : mesa.estado === 'ocupada' ? 'bg-orange-300  text-white w-[320px] h-[200px] rounded-lg flex flex-col justify-between' : 'bg-cyan-300  text-white w-[320px] h-[200px] rounded-lg flex flex-col justify-between';    
    

    return (
        <div className={backgroundColor}  >
            <div className='flex flex-col items-center justify-center h-full'>
                <h1 className='text-white text-2xl font-bold'> {mesa.nombre}</h1>
                <span className='text-gray-200 text-xl'>Capacidad: {mesa.capacidad}</span>
                <span className='text-gray-400 text-sm'>Estado: {mesa.estado}</span>
                {JSON.stringify(mesa.pedido)}
            </div>

            

            {
                mesa.estado === 'disponible' ? (
                    <Link href={route('pedido.create',mesa.id)} className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
                        Crear Pedido
                    </Link>
                ) : mesa.estado === 'ocupada' ? (
                    <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
                        Ocupado
                    </button>
                ) : (
                    <button className='bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded'>
                        Reservado
                    </button>
                )   
            }
            
        </div>
    );
};

export default DrawedMesa;