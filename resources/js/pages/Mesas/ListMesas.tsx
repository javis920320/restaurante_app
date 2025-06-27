import React from 'react'
//import { ListaMesas } from '../../muckups/data'
import CardMesa from './CardMesa'

const ListMesas = ({ListaMesas}:any) => {
const filterDisponibilidad =[
    "disponible",
    "ocupada",
    "reservado",
]


    return (
        <div className=' flex flex-col gap-4  p-4 rounded-lg shadow-md '> 
            <h1 className='text-2xl font-bold'>Mesas</h1>
            {
                filterDisponibilidad.map((disponibilidad) => (
                    <div key={disponibilidad} className='flex  flex-row items-center gap-2 '>
                        <div className={`w-4 h-4 rounded-full ${disponibilidad === "disponible" ? "bg-green-500" : disponibilidad === "ocupada" ? "bg-red-500" : "bg-blue-500"}`}></div>
                        <span>{disponibilidad}</span>
                    </div>
                ))  
            }

            
            <div className='grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-1 gap-5'>   
                {Array.isArray(ListaMesas) && ListaMesas.map((mesa) => (
                    <CardMesa key={mesa.id} mesa={mesa} />
                ))}
            </div>

        </div>

    )
}

export default ListMesas