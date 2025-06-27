import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

import axios from "axios"
import { useState } from 'react';

const FormularioMesa = ({ onMesaCreada, mesa }: any) => {
    //definimos un estado si la peticion  con axios es exitosa o no
    const [isSuccess, setIsSuccess] = useState(false);
    const ubicaciones = [
        'Interior',
        'Exterior',
        'Patio',
        'Balcón',
        'Jardín',
        'Barra',
        'Terraza',
        'VIP',
        'Zona de fumadores'];


    const { data, setData, post, processing, errors, setError } = useForm({
        nombre: mesa ? mesa.nombre : '',
        capacidad: mesa ? mesa.capacidad : 0,
        ubicacion: mesa ? mesa.ubicacion : '',
        estado: mesa ? mesa.estado : 'disponible',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            
            if (!data.nombre || !data.capacidad || !data.ubicacion || !data.estado) {
                setError({
                    nombre: data.nombre ? '' : 'El nombre es obligatorio',
                    capacidad: data.capacidad > 0 ? '' : 'La capacidad debe ser mayor a 0',
                    ubicacion: data.ubicacion ? '' : 'La ubicación es obligatoria',
                    estado: data.estado ? '' : 'El estado es obligatorio',
                });
                return;
            }

            //SI la mesa ya existe, actualizamos sus datos
            if (mesa) {
               

                const response = await axios.put(route('mesas.update', mesa.id), data);
                if (response.status == 200) {
                    const { mesaActualizada } = response.data;
                    setTimeout(() => {
                        setIsSuccess(false);
                    }, 3000); // Resetea el estado de éxito después de 3 segundos
                    setIsSuccess(true);
                    onMesaCreada({ mesaActualizada });
                    setData({
                        nombre: '',
                        capacidad: 0,
                        ubicacion: '',
                        estado: 'disponible',
                    });
                    setError({
                        nombre: '',
                        capacidad: '',
                        ubicacion: '',
                        estado: '',
                    });
                    
                }
                return;
            }

            const response = await axios.post(route('mesas.store'), data)

            if (response.status == 200) {
                const { nuevaMesa } = response.data;
                  setTimeout(() => {
                        setIsSuccess(false);
                    }, 3000);
                setIsSuccess(true);
                onMesaCreada({ nuevaMesa });
                setData({
                    nombre: '',
                    capacidad: 0,
                    ubicacion: '',
                    estado: 'disponible',
                });
                setError({
                    nombre: '',
                    capacidad: '',
                    ubicacion: '',
                    estado: '',
                });
                console.log(nuevaMesa);
            }

        } catch (error: any) {

            if (error.response && error.response.data && error.response.data.errors) {
                const errorData = error.response.data.errors;
                setError({
                    nombre: errorData.nombre ? errorData.nombre[0] : '',
                    capacidad: errorData.capacidad ? errorData.capacidad[0] : '',
                    ubicacion: errorData.ubicacion ? errorData.ubicacion[0] : '',
                    estado: errorData.estado ? errorData.estado[0] : '',
                });
                return;
            }
            // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje al usuario
        }


    }


    return (
        <form onSubmit={handleSubmit} className="p-2 rounded-lg shadow-md mb-4 flex flex-col h-[350px]">
            
            <p className='text-gray-500'>Configura las mesas de tu restaurante</p>
            <Input
                type="text"
                placeholder="Nombre de la mesa"
                value={data.nombre}
                onChange={(e) => setData('nombre', e.target.value)}
                className="mb-4"
                disabled={mesa ? true : false}
            />

            <Select value={data.ubicacion} onValueChange={(value) => setData('ubicacion', value)} defaultValue={data.ubicacion} >
                <SelectTrigger className='w-full mt-1' >
                    <span className='text-gray-500'>{data.ubicacion ? data.ubicacion : "Seleccionar Ubicación"}</span>
                </SelectTrigger>
                <SelectContent className='w-full'>
                    {ubicaciones.map((ubicacion: string) => (
                        <SelectItem key={ubicacion} value={ubicacion}>{ubicacion}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Label>Capacidad</Label>
            <Input
                type="number"
                placeholder="Capacidad de la mesa"
                    min={1}
                value={data.capacidad}
                onChange={(e) => setData('capacidad', parseInt(e.target.value))}
                className="my-4"
            />
            <Select value={data.estado} onValueChange={(value) => setData('estado', value)} defaultValue={data.estado}>
                <SelectTrigger className='w-full mt-1'>
                    <span className='text-gray-500'>{data.estado ? data.estado : "Seleccionar estado"}</span>
                </SelectTrigger>
                <SelectContent className='w-full'>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="ocupada">Ocupada</SelectItem>
                    <SelectItem value="reservada">Reservada</SelectItem>
                    <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                </SelectContent>
            </Select>



            <button
                type="submit"
                className=" my-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={processing}
            >
                {processing ? 'Guardando...' : 'Guardar Mesa'}
            </button>
            {isSuccess && <p className="text-green-500">Mesa guardada exitosamente</p>}
            {errors.nombre && <p className="text-red-500">{errors.nombre}</p>}
            {errors.capacidad && <p className="text-red-500">{errors.capacidad}</p>}
            {errors.estado && <p className="text-red-500">{errors.estado}</p>}
            {errors.ubicacion && <p className="text-red-500">{errors.ubicacion}</p>}
        </form>
    )
}

export default FormularioMesa