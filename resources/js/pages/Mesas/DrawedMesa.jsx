import { Link } from '@inertiajs/react';
import { CoffeeIcon } from 'lucide-react';
import React from 'react';

const DrawedMesa = ({ mesa }) => {
    const handleCrearPedido = () => {
        // Aquí puedes agregar la lógica para crear un pedido
        console.log(`Creando pedido para la mesa ${mesa.id}`);
    };

    return (
        <div className='bg-gray-900 text-white p-4 rounded-lg shadow-md w-[320px] h-[200px] flex flex-col justify-between '>
            <div className='flex flex-col items-center justify-center h-full'>
                <h1 className='text-white text-2xl font-bold'> {mesa.nombre}</h1>
                <span className='text-gray-200 text-xl'>Capacidad: {mesa.capacidad}</span>
                <span className='text-gray-400 text-sm'>Estado: {mesa.estado}</span>
            </div>

            <Link href={route("pedido.create",mesa.id)}><button 
                onClick={handleCrearPedido} 
                className='bg-green-500 hover:bg-green-600 text-white p-2 rounded-md flex items-center gap-2 transition-colors duration-300'>
                <CoffeeIcon className='w-5 h-5' />
                Crear Pedido
            </button>
            </Link>
        </div>
    );
};

export default DrawedMesa;