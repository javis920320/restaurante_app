import React from 'react'
import { ListaMesas } from '../../muckups/data'
import CardMesa from './CardMesa'

const ListMesas = () => {
const filterDisponibilidad =[
    "Disponible",
    "Ocupado",
    "Reservado",
]

    return (
        <div className=' flex flex-col gap-4'>
            <h1 className='text-2xl font-bold'>Mesas</h1>
            {
                filterDisponibilidad.map((disponibilidad) => (
                    <div key={disponibilidad} className='flex items-center gap-2'>
                        <div className={`w-4 h-4 rounded-full ${disponibilidad === "Disponible" ? "bg-green-500" : disponibilidad === "Ocupado" ? "bg-red-500" : "bg-yellow-500"}`}></div>
                        <span>{disponibilidad}</span>
                    </div>
                ))  
            }

            
            <div className='grid grid-cols-3 gap-4'>
                {Array.isArray(ListaMesas) && ListaMesas.map((mesa) => (
                    <CardMesa key={mesa.id} mesa={mesa} />
                ))}
            </div>

        </div>

    )
}

export default ListMesas