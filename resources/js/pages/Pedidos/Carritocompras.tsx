import { usePedido } from '@/context/PedidoContext'
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {  Trash } from 'lucide-react'
import React from 'react'
import axios from "axios"

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import Loader from '@/components/mycomponents/Loader';

const CarritoCompras = () => {

  const { auth } = usePage<SharedData>().props;
  //obtener el parametro de la url
  const mesa = window.location.pathname.split('/').pop();
  const [pedido_enviado,setPedidoEnviado] = React.useState(false);
  const[message,setMessage] = React.useState('')
  const { items, eliminarPedido, user_id, agregarPedido,agregarPedidoConCantidad,limpiarCarrito} = usePedido()


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
        setPedidoEnviado(true)
        setTimeout(() => {
          setPedidoEnviado(false)
          setMessage(response.data.message)
           limpiarCarrito()
           //redireccionar a la pagina de pedidos
          window.location.href = route('dashboard');
         
        //vaciar el carrito
          
        }, 2000)

        
         setMessage('')
       
      

      })
      .catch((error) => {
        console.error(error)

      })

  }


  return (
    <div className='flex flex-col items-center justify-evenly '>

         

 <section>
  <header className="mb-2 ">
          <h3 className="text-lg font-semibold text-gray-600">Mesero: {auth.user.name}</h3>
          <p className="text-center text-sm text-gray-500">Platos Seleccionados</p>
          
      </header>
 
      {Array.isArray(items) && items.length > 0 ? (
        items.map((item) => (
          <Card key={item.plato_id} className=" rounded-lg  h-30 mb-2 grid grid-cols-3 ">
            <CardHeader>
              <img src={item.image ? "" : "/images/placeholder.svg"} width={70} alt="" />
            </CardHeader>
            <CardContent className='text-sm  '>
              <p><strong>{item.plato.nombre}</strong></p>
              <p>{item.plato.descripcion}</p>

            </CardContent>
            <CardFooter className='gap-2 flex flex-col items-center justify-between '>
              <div className='flex items-center gap-2'>
                <Input type='number' min={1} onChange={(e)=>modificarCantidad(item.plato_id,parseInt(e.target.value))}></Input>


                <button
                  onClick={() => eliminarPedido(item.plato_id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <Trash size={24} />
                </button>
              </div>

              <p>{item.plato.precio ? (item.plato.precio*item.cantidad).toLocaleString('es-ES', { style: 'currency', currency: 'COP' }) : '0,00 €'}</p>


            </CardFooter>

          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-4">No hay platos seleccionados.</p>
      )}
      </section>
      <form onClick={handleEnviarPedido} className='relative bottom-0'>
        <div className="flex flex-col justify-start mt-4">
          <p className="text-lg font-semibold text-gray-600">Total: {items.reduce((total, item) => total + (item.plato.precio * item.cantidad), 0).toLocaleString('es-ES', { style: 'currency', currency: 'COP' })}</p>

          {items.length>0&&<button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Enviar Pedido
          </button>}
          {message && <p className="text-green-500 mt-2">{message}</p>  }
          {pedido_enviado && <Loader/>}
          

        </div>
      </form>
    </div>
  )
}

export default CarritoCompras
