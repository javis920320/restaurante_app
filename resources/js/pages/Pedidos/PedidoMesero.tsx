import { usePedido } from '@/context/PedidoContext'
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { RemoveFormatting, Trash } from 'lucide-react'
import React from 'react'

const PedidoMesero = () => {
  //obtener el usuario de la sesion
    const { auth } = usePage<SharedData>().props;

  const { items,eliminarPedido,user_id } = usePedido()

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Pedido del Mesero
      </h2>

      <section className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">Mesero: {auth.user.name}</h3>
            
        <p className="text-center text-sm text-gray-500">Platos Seleccionados</p>
        </div>
      </section>

      {Array.isArray(items) && items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Plato ID</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Sub Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.plato_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{item.plato_id}</td>
                  <td className="px-4 py-2 text-center">{item.cantidad}</td>
                  <td className="px-4 py-2 text-center">${item.precio.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </td>
                  <td><button  className='text-red-300' onClick={()=>eliminarPedido(item.plato_id)}><Trash></Trash></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-gray-700">
                <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                <td className="px-4 py-2 text-center">${items.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2)}</td>
              </tr> 
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">No hay platos seleccionados.</p>
      )}
    </div>
  )
}

export default PedidoMesero
