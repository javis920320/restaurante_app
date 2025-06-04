
import AppLayout from '@/layouts/app-layout'
import ConfiguracionLayout from '@/layouts/configuracion/layout'
import { Mesa } from '@/types'
import { Head } from '@inertiajs/react'
import React from 'react'
import { ListaPedidosporpedir as pedidos } from '@/muckups/data'
import ItemPedido from '../Pedidos/ItemPedido'
import { Pencil } from 'lucide-react'
import { Button } from '@headlessui/react'
import { Input } from '@/components/ui/input'

const Show = ({ mesa }: any) => {
  return (
    <AppLayout >
      <Head title={`Gestionar mesa ${mesa.id}`}></Head>
      <ConfiguracionLayout>
        <h1 className='text-2xl font-bold'>Gestionar Mesa # {mesa.id}</h1>
        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-5 w-[1000px] border rounded-lg p-6'>
          <div className='bg-white p-4 rounded-lg shadow-md bg-white dark:bg-gray-900 h-[200px] mt-4'>
            <div className='flex items-center justify-between mb-4'>

              <h2 className='text-xl font-semibold mb-4 text-gray-400 dark:text-gray-50'>Detalles de la Mesa</h2>
              <Button className={"cursor-pointer"}> <Pencil></Pencil></Button>
            </div>

            <p><strong>Nombre:</strong> {mesa.nombre}</p>
            <p><strong>Capacidad:</strong> {mesa.capacidad}</p>
            <p><strong>Ubicación:</strong> {mesa.ubicacion}</p>
            <p><strong>Estado:</strong> {mesa.estado}</p>
            <form action="">
              <Input></Input>
              <div className='mt-4'>
                <label htmlFor="estado" className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Estado de la Mesa</label>
                <select id="estado" name="estado" className='mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="reservada">Reservada</option>
                </select>
              </div> 
              <div className='mt-4'>
                <label htmlFor="estado" className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Estado de la Mesa</label>
                <select id="estado" name="estado" className='mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'>
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="reservada">Reservada</option>
                </select>
              </div>  
            </form>
          </div>
          <div>
            <p className='text-gray-500'>Aquí puedes gestionar los detalles de la mesa seleccionada.</p>

            {pedidos && pedidos.length > 0 ? (
              <div>
                <h3 className="font-bold">Pedidos en cocina:</h3>
                <ul>
                  {pedidos.map((pedido: any) => (
                    <ItemPedido pedido={pedido}></ItemPedido>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No hay pedidos en cocina para esta mesa.</p>
            )}
          </div>


        </div>
      </ConfiguracionLayout>

    </AppLayout>



  )
}

export default Show