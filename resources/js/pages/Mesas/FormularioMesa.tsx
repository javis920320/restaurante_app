import { Input } from '@/components/ui/input'
import { useForm } from '@inertiajs/react';
import axios from "axios"

const FormularioMesa = ({ onMesaCreada }: any) => {
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
        nombre: '',
        capacidad: 0,
        ubicacion: '',
        estado: 'disponible',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const response = await axios.post(route('mesas.store'), data)
            if (response.status == 200) {
                const { nuevaMesa } = response.data;
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

        } catch (error) {

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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-md mb-4 flex flex-col h-[350px]">

            <p className='text-gray-500'>Configura las mesas de tu restaurante</p>
            <Input
                type="text"
                placeholder="Nombre de la mesa"
                value={data.nombre}
                onChange={(e) => setData('nombre', e.target.value)}
                className="mb-4"
            />
            <select
                value={data.ubicacion}
                onChange={(e) => setData('ubicacion', e.target.value)}
                className="mb-4 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Seleccione una ubicación</option>
                {ubicaciones.map((ubicacion: string) => (
                    <option key={ubicacion} value={ubicacion}>
                        {ubicacion}
                    </option>
                ))}
            </select>

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
                className="mb-4 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            {errors.ubicacion && <p className="text-red-500">{errors.ubicacion}</p>}
        </form>
    )
}

export default FormularioMesa