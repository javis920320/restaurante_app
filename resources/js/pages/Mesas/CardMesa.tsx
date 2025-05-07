import React from 'react'

interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  estado: string;
}

const CardMesa: React.FC<{ mesa: Mesa }> = ({ mesa }) => {
  return (
    <div key={mesa.id} className='border p-4 rounded-lg'>
                <h2 className='text-xl font-semibold'>{mesa.nombre}</h2>
                <p>Capacidad: {mesa.capacidad}</p>
                <p>Estado: {mesa.estado}</p>
            </div>
  )
}

export default CardMesa