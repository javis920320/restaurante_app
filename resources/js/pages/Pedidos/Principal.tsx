import AppLayout from '@/layouts/app-layout'
import { Categoria, Mesa } from '@/types'
import React from 'react'
import PlatosDisponibles from './PlatosDisponibles';
import PedidoMesero from './Carritocompras';
import { Head } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { useCategorys } from '@/hooks/use-categorys';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Star } from 'lucide-react';
import { Menu, MenuButton } from '@headlessui/react';


interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    estado: string;
    categoria_id: number;
}

interface PrincipalProps {
    mesa: Mesa;
    platos: Plato[];
    categorias: Categoria[];
}

const Principal: React.FC<PrincipalProps> = ({ mesa, platos, categorias }) => {
    const [listofpedidos, setListPedidos] = React.useState([]);
    const [listofcategorias, setListCategorias] = React.useState([]);
    const [listofplatos, setListPlatos] = React.useState([]);

    const { handleFilter, filterCategoria } = useCategorys({ categorias })

    const ListFilterPlates = () => {
        if (filterCategoria.length > 0) {
            return platos.filter((plato: any) => filterCategoria.some((cat: any) => cat.id === plato.categoria_id));
        } else {
            return platos;
        }
    }

    const filteredPlatos = ListFilterPlates();

    return (
        <AppLayout>
            <Head title="Crear Pedido" />
            <h1 className='text-2xl font-bold'>{mesa.nombre}</h1>
            <p className='text-gray-500'>Crear Pedido</p>

            <section className='flex gap-4 items-center justify-between m-2'>
                <Input placeholder='Buscar platos...'></Input>
                <Button > <Star></Star> Favoritos</Button>


            </section>
            {/* <Menu>

                <MenuButton as="div" className='flex gap-4 items-center justify-between m-2'>
                    <h2 className='text-xl font-bold'>Categorías</h2>
                    <div className='flex gap-2'>
                        {categorias && categorias.map((categoria: Categoria) => (
                            <Badge key={categoria.id} className={
                                filterCategoria.some((cat: any) => cat.id === categoria.id)
                                    ? 'cursor-pointer'
                                    : 'bg-gray-200 text-gray-800 cursor-pointer'
                            }
                                variant='outline' onClick={() => handleFilter(categoria.id)} >
                                {categoria.nombre}
                            </Badge>
                        ))}
                    </div>
                </MenuButton>
            </Menu> */}


            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2'>

                {/*  {categorias&& categorias.map((categoria: Categoria) => (
                <Badge key={categoria.id} className={
                    filterCategoria.some((cat:any) => cat.id === categoria.id)
                        ? 'cursor-pointer'
                        : 'bg-gray-200 text-gray-800 cursor-pointer'   
                }
                 variant='outline' onClick={()=>handleFilter(categoria.id)} >
                    {categoria.nombre}      

                </Badge>
              )) } */}



                {filteredPlatos.length === 0 && <p className='text-red-500'>No hay platos disponibles</p>}
                {Array.isArray(filteredPlatos) && filteredPlatos.map((plato: any) => (
                    <PlatosDisponibles key={plato.id} plato={plato} />
                ))}

            </section>


        </AppLayout>
    )
}

export default Principal