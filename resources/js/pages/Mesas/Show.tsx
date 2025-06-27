
import AppLayout from '@/layouts/app-layout'
import ConfiguracionLayout from '@/layouts/configuracion/layout'
import { Head, useForm } from '@inertiajs/react'
import { ListaPedidosporpedir as pedidos, Ubicaciones_mesas } from '@/muckups/data'
import ItemPedido from '../Pedidos/ItemPedido'


import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import FormularioMesa from './FormularioMesa'

const Show = ({ mesa }: any) => {
  const { data, setData } = useForm({
    capacidad: mesa.capacidad,
    ubicacion: mesa.ubicacion,
    estado: mesa.estado,
  })

  return (
    <AppLayout >
      <Head title={`Gestionar mesa ${mesa.id}`}></Head>
      <ConfiguracionLayout>
        <h1 className='text-2xl font-bold'>Gestionar Mesa # {mesa.id}</h1>
        
        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-5  w-[80dvw] border rounded-lg p-6'>
          <div className='p-4 rounded-lg shadow-md   h-auto mt-4'>
            

              <h2 className='text-xl font-semibold mb-4 text-gray-700 dark:text-gray-50'>Detalles de la Mesa</h2>
              <FormularioMesa mesa={mesa}/>

            
            
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