import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePedido } from '@/context/PedidoContext';
import { Plato } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import React from 'react';

interface PlatosDisponiblesProps {
    plato: Plato;
}

const PlatosDisponibles = ({ plato }: PlatosDisponiblesProps) => {
    // Obtén la mesa desde el contexto de la página actual
    const { mesa } = usePage().props;
    const { agregarPedido } = usePedido();

    // Manejo del formulario
    const { data, setData } = useForm({
        cantidad: 0,
        mesa_id: mesa.id, // Asegúrate de que mesa tenga un id válido
        plato_id: plato.id,
        precio: plato.precio, // Incluye el precio del plato
    });

    // Manejo del envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.cantidad > 0) {
            agregarPedido({
                plato_id: data.plato_id,
                cantidad: data.cantidad,
                
                precio: data.precio,
            });
            console.log('Pedido agregado:', data);
        } else {
            console.error('La cantidad debe ser mayor a 0');
        }
    };

    return (
        <Card className="w-full h-64 rounded-lg">
            <form onSubmit={handleSubmit}>
                <img
                    src={plato.imagen}
                    alt={plato.nombre}
                    className="w-full h-32 object-cover rounded-t-lg"
                />
                <h2 className="text-center">{plato.nombre}</h2>
                <section className="flex flex-col items-center">
                    <p>{plato.descripcion}</p>
                    <p>${plato.precio.toFixed(2)}</p>
                </section>
                <section className="flex flex-row items-center">
                    <Input
                        type="number"
                        placeholder="Cantidad"
                        className="w-1/2"
                        value={data.cantidad}
                        onChange={(e) => setData('cantidad', parseInt(e.target.value))}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Agregar
                    </button>
                </section>
            </form>
        </Card>
    );
};

export default PlatosDisponibles;