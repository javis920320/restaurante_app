import { Input } from '@/components/ui/input'
import { useForm } from '@inertiajs/react'
import React from 'react'
import axios from 'axios'
const FormularioMesa = () => {

     const { data, setData, post, processing, errors,setError } = useForm({
        nombre: '',
        capacidad: 0,
        estado: 'disponible',   
     })

    const handleSubmit = async(e: React.FormEvent) => {
            e.preventDefault()
            try {
                const respuesta=await  axios.post(route("mesas.store"), data);
                if (respuesta.status === 200) {
                    setData({ nombre: '', capacidad: 0, estado: 'disponible' }) // Reinicia los datos del formulario
                } else {
                    respuesta.data.errors.forEach((error: any) => {
                        setError(error.field, error.message); // Establece el error en el campo correspondiente 
                    })
                }
                
            } catch (error: any) {
                if (error.response && error.response.data.errors) {
                    const backendErrors = error.response.data.errors;
                    Object.keys(backendErrors).forEach((key: any) => {
                        setError(key, backendErrors[key][0]); // Establece el error en el campo correspondiente
                    });
                }   
                
            }


          
    }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">   
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