import React from 'react'

const ItemPedido = ({ pedido }: any) => {
    return (
        <div>
            <div className="flex flex-col items-center justify-between p-4 bg-white shadow-md rounded-lg mb-4">
                <div className='flex flex-col justify-between items-start w-full'>
                    <div className="flex justify-between w-full">
                        <h2 className="text-sm text-gray-500">Codigo:#{pedido.id}</h2>
                        <span className="text-sm text-gray-700">Fecha: {new Date(pedido.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className='flex juestify-between items-center w-full'>
                        <p className="text-sm text-gray-500">Responsable:{pedido.user_id}</p>


                    </div>





                </div>
                
                    
                    {pedido.platos.length > 1 && pedido.platos.map((plato) => (
                        <div key={plato.id} className="mb-2 flex flex-row items-start border border-gray-200 p-2 rounded-lg w-full">   
                            <img src={plato.imagen} alt={plato.nombre} className="w-16 h-16 object-cover rounded-lg m-2" />
                            <div className='flex flex-col items-start justify-between w-full border-b border-gray-200 pb-2 mb-2'>

                            <h3 className="text-lg font-semibold text-gray-700">{plato.nombre}</h3>
                            <p className="text-sm text-gray-500">Cantidad: {plato.cantidad}</p>
                            </div>
                            <p className="text-sm text-gray-500">Precio: ${plato.precio}</p>
                        </div>
                    )

                    )}
                    <h3 className="text-lg font-semibold text-gray-700">{pedido.platos.nombre}</h3>
                    <p className="text-sm text-gray-500">Cantidad: {pedido.platos.cantidad}</p>
                    <p className="text-sm text-gray-500">Precio: ${pedido.platos.precio}</p>
                
                <div>
                    <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Cancelar
                    </button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Preparar
                    </button>

                </div>

            </div>
        </div>
    )
}

export default ItemPedido