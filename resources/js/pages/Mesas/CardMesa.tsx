
import { Pedido } from '@/types';
import { Button } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { LocateIcon, Map, Pencil } from 'lucide-react';
import React from 'react'

interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion: string;
  estado: string;
  pedido?: Pedido[]
}

const isEstadoMesa = (estado: string) => {
  switch (estado) {
    case "disponible":
      return " border-green-500 text-green-500";
    case "ocupada":
      return "border-orange-500 text-orange-500";
    case "reservada":
      return "border-blue-500 text-blue-500";
    default:
      return "Desconocido";
  }
}


const CardMesa: React.FC<{ mesa: Mesa }> = ({ mesa }) => {
  return (
    <div key={mesa.id} className={' bg-white  dark:bg-gray-900 border p-4 rounded-lg  ' + isEstadoMesa(mesa.estado)}>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold'>{mesa.nombre}</h2>
        <Link href={route('mesas.show', mesa.id)} className='text-gray-900 text[10px] hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'><Pencil size={18} />  </Link>


      </div>

      <p>Capacidad: {mesa.capacidad}</p>
      <p>Estado: {mesa.estado}</p>
      <p className='flex gap-2'> <Map></Map> Ubicación : ({mesa.ubicacion})</p>
      {mesa.estado === 'ocupada' && (

        <Link href={route('mesas.show', mesa.id)} >

          <Button className='text-orange-50 bg-orange-400 w-full rounded-lg border border-orange-300 hover:underline p-4 cursor-pointer'>
            Codigo Pedido #{mesa.pedido && mesa.pedido.length > 0 ? mesa.pedido[0].id : 'Sin pedido'}
          </Button>
        </Link>
      )}
      {mesa.estado === 'reservada' && (
        <p className='text-blue-500 cursor-pointer'>Esta mesa está reservada</p>
      )}
      {mesa.estado === 'disponible' && (

        <Link href={route('pedido.create', mesa.id)} >

          <Button className='text-green-50  bg-green-400 w-full rounded-lg border border-green-300 hover:underline p-4  cursor-pointer'>
            Crear Pedidos
          </Button>
        </Link>
      )}


    </div>
  )
}

export default CardMesa