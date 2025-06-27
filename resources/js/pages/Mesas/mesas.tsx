import React, { useState } from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Mesa } from '@/types';
import ListMesas from './ListMesas';
import FormularioMesa from './FormularioMesa';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';





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

        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mesa </DialogTitle>
              <DialogDescription>
              
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              
              <FormularioMesa onMesaCreada={agregarMesa} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
              {/* <Button>Acción</Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        

        <div className=' w-[70dvw]'>
          <ListMesas ListaMesas={Listmesas} />
        </div>



      </ConfiguracionLayout>

    </AppLayout>

  )
}

export default Mesas