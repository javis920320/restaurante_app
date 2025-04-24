import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';

const mesas = () => {
  return (
    <AppLayout>
        <Head title="Mesas" /> 
        <ConfiguracionLayout>
        <div>mesas</div>

        </ConfiguracionLayout>

    </AppLayout>
    
  )
}

export default mesas