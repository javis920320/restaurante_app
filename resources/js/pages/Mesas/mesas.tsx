import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import {ListaMesas} from '../../muckups/data';  
import ListMesas from './ListMesas';
import FormularioMesa from './FormularioMesa';

const mesas = () => {
  return (
    <AppLayout>
        <Head title="Mesas" /> 

        <ConfiguracionLayout>
        <div className='flex flex-col gap-4'>
            <h1 className='text-2xl font-bold'>Mesas</h1>
            <p className='text-gray-500'>Configura las mesas de tu restaurante</p>  
            <FormularioMesa/>
        </div>
        
        <ListMesas/>

        </ConfiguracionLayout>

    </AppLayout>
    
  )
}

export default mesas