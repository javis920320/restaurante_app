import { usePedido } from '@/context/PedidoContext'
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Car, RemoveFormatting, Trash } from 'lucide-react'
import React from 'react'
import axios from "axios"

import { Card } from '@/components/ui/card';
import NumberInput from '@/components/mycomponents/number-input';

const PedidoMesero = () => {
  //obtener el usuario de la sesion
  const { auth } = usePage<SharedData>().props;
  //obtener el parametro de la url
  const mesa = window.location.pathname.split('/').pop();

  const { items, eliminarPedido, user_id, agregarPedido } = usePedido()
  //metodo para modificar la cantidad de platos
 const modificarCantidad = (platoId: number, cantidad: number) => { 
    const item = items.find(item => item.plato_id === platoId);
    if (item) {
      agregarPedido({ ...item, cantidad });
    }
  }

  const handleEnviarPedido = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      user_id: user_id,
      items: items,
      mesa_id: mesa,
      estado: 'en concina',
    }

    axios.post(route('pedido.store'), data)
      .then((response) => {
        console.log(response.data)

      })
      .catch((error) => {
        console.error(error)

      })


    // Aquí puedes enviar el pedido al servidor o realizar cualquier otra acción necesaria

  }


  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg ">
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
        items.map((item) => (
          <Card key={item.plato_id} className="w-full h-24 rounded-lg  relative mb-2">
            <div className="flex  items-center justify-around">
              <div className="flex items-center ">
                {/* <img
                src={item.plato.imagen}
                alt={item.plato.nombre}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              /> */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">{item.plato.nombre}</h3>
                  <p className="text-sm text-gray-500">{item.plato.descripcion}</p>
                </div>
              </div>
              <div className='flex items-center justify-between w-auto'>  
                <NumberInput 
                  cantidad={item.cantidad} 
                  platoId={item.plato_id} 
                  modificarCantidad={modificarCantidad} 
                />
                <button
                  onClick={() => eliminarPedido(item.plato_id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <Trash size={24} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-semibold text-gray-700">
                Precio: ${item.precio.toFixed(2)}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                Total: ${(item.precio * item.cantidad).toFixed(2)}
              </p>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-4">No hay platos seleccionados.</p>
      )}
      <form onClick={handleEnviarPedido}>
        <div className="flex justify-center mt-4">

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Enviar Pedido
          </button>
        </div>
      </form>
    </div>
  )
}

export default PedidoMesero
