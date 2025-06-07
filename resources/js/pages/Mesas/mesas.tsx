import React, { useState } from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Mesa } from '@/types';
import ListMesas from './ListMesas';
import FormularioMesa from './FormularioMesa';





const Mesas = ({ mesas }: any) => {
  const [Listmesas, setListMesas] = useState(mesas);
  //function para agreagar una nueva mesa
  const agregarMesa = ({ nuevaMesa }: any) => {
    
    setListMesas((prevMesas: Mesa[]) => [...prevMesas, nuevaMesa]); 
  }




  return (
    <AppLayout>
      <Head title="Mesas" />

      <ConfiguracionLayout>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded-lg mb-4'
          onClick={() => {
            const dialog = document.querySelector('dialog');
            if (dialog) {
              dialog.showModal();
            }
          }}
        >
          Agregar Mesa
        </button>
        <dialog className='bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-md w-[500px] content-center'>
          <button
            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
            onClick={() => {
              const dialog = document.querySelector('dialog');
              if (dialog) {
                dialog.close();
              }
            }}  
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>  
          </button>
          <FormularioMesa onMesaCreada={agregarMesa} />
        </dialog>
        <div className='grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 gap-5 w-[1000px]'>
          {/* <FormularioMesa onMesaCreada={agregarMesa} /> */}
          <ListMesas ListaMesas={Listmesas} />
        </div>



      </ConfiguracionLayout>

    </AppLayout>

  )
}

export default Mesas