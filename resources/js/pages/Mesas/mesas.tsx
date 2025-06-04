import React, { useState } from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import {ListaMesas} from '../../muckups/data';  
import ListMesas from './ListMesas';
import FormularioMesa from './FormularioMesa';

import axios from 'axios';


const mesas = ({mesas}:any) => {
const [Listmesas,setListMesas]=useState(mesas); 
  
  const { data, setData, post, processing, errors,setError} = useForm({
    nombre: '',
    capacidad: 0,
    ubicación: '',
    estado: 'disponible',
  });
  const handleSubmit=async(e: React.FormEvent) => { 

    e.preventDefault();
    axios.post(route("mesas.store"), data).then((response) => { 
      if (response.status === 200) {
        setData({ nombre: '', capacidad: 0, ubicación: '', estado: 'disponible' }); // Reinicia los datos del formulario
        setListMesas([...Listmesas, response.data.mesa]); // Agrega la nueva mesa a la lista de mesas 

      } else {

        response.data.errors.forEach((error: any) => {
          setError(error.field, error.message); // Establece el error en el campo correspondiente 
        }); 

    
      }
    })
  
    
  }

  return (
    <AppLayout>
        <Head title="Mesas" /> 

        <ConfiguracionLayout>
        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-5 w-[1200px]'>    
            <FormularioMesa data={data} handleSubmit={handleSubmit} processing={processing} errors={errors} setData={setData}/>
            <ListMesas ListaMesas={Listmesas}/>
        </div>
        
        

        </ConfiguracionLayout>

    </AppLayout>
    
  )
}

export default mesas