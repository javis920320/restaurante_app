import { Input } from '@/components/ui/input'
import { useForm } from '@inertiajs/react'
import React from 'react'
import axios from 'axios'
const FormularioMesa = ({data,setData,processing, errors,handleSubmit}:any) => {
const ubicaciones = [
    'Interior',
    'Exterior',
    'Barra',
    'Terraza',  
    'VIP',
    'Zona de fumadores']




  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-lg shadow-md mb-4 flex flex-col">    
    <p className='text-gray-500'>Configura las mesas de tu restaurante</p> 
        <Input
            type="text"
            placeholder="Nombre de la mesa"
            value={data.nombre}
            onChange={(e) => setData('nombre', e.target.value)} 
            className="mb-4"    
        />
        <Input
            type="number"
            placeholder="Capacidad de la mesa"
            
            value={data.capacidad}
            onChange={(e) => setData('capacidad', parseInt(e.target.value))} 
            className="mb-4"    
        />
        <select
            value={data.ubicacion}
            onChange={(e) => setData('ubicacion', e.target.value)} 
            className="mb-4"    
            >
            <option value="">Seleccione una ubicación</option>  
              {ubicaciones.map((ubicacion: string) => ( 
                <option key={ubicacion} value={ubicacion}>
                    {ubicacion}
                </option>
                ))}  
            </select>


        <select
            value={data.estado}
            onChange={(e) => setData('estado', e.target.value)} 
            className="mb-4"
        >
            <option value="disponible">Disponible</option>  
            <option value="ocupada">Ocupada</option>    
            <option value="reservada">Reservada</option>    
        </select>   
        <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={processing}   
        >
            {processing ? 'Guardando...' : 'Guardar Mesa'}
        </button>
        {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}  
        {errors.capacidad && <p className="text-red-500">{errors.capacidad}</p>}    
        {errors.estado && <p className="text-red-500">{errors.estado}</p>}  
    </form>
  )
}

export default FormularioMesa