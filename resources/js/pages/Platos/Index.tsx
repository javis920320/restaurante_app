import React from 'react'
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { Categoria, type Plato } from '@/types';
import Formulario from './Formulario';
import { Badge } from '@/components/ui/badge';

export default function Index({ categorias, platos }: { categorias: { id: number; nombre: string }[], platos: Plato[] }) {

  const [ListaPlatos, setListPlatos] = React.useState<Plato[]>(platos); // Estado para los platos 
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<Categoria[]>([


  ]);

  const handleClickCategoria = (categoriaId: number) => {
    setCategoriaSeleccionada((prevCategorias:Categoria[]) => {
        const existeCategoria = prevCategorias.some((cat) => cat.id === categoriaId);
        let nuevasCategorias;

        if (existeCategoria) {
            // Si ya está seleccionada, la eliminamos
            nuevasCategorias = prevCategorias.filter((cat) => cat.id !== categoriaId);
        } else {
            // Si no está seleccionada, la agregamos
            const categoria = categorias.find((cat) => cat.id === categoriaId);
            nuevasCategorias = categoria ? [...prevCategorias, categoria] : prevCategorias;
        }

        // Actualizamos los platos según las categorías seleccionadas
        if (nuevasCategorias.length > 0) {
            setListPlatos(
                platos.filter((plato) =>
                    nuevasCategorias.some((categoria) => categoria.id === plato.categoria_id)
                )
            );
        } else {
            // Si no hay categorías seleccionadas, mostramos todos los platos
            setListPlatos(platos);
        }

        return nuevasCategorias; // Actualizamos el estado de las categorías seleccionadas
    });
};



  const listplatosnotfound = ListaPlatos.length > 0 ? true : false; // Verifica si hay platos 


  return (
    <AppLayout>
      <Head title="Platos" />
      <ConfiguracionLayout >
        <div>Platos</div>
        <Formulario categorias={categorias} />
        
        <section>
          {categorias && categorias.map((categoria) => (<Badge key={categoria.id} variant="outline" className={`mr-2 cursor-pointer ${categoriaSeleccionada.some((cat: Categoria) => cat.id === categoria.id) ? "bg-gray-500 text-white" : ""
            }`} onClick={()=>handleClickCategoria(categoria.id)}>{categoria.nombre}</Badge>))}

        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ListaPlatos.length === 0 && (
            <div className="col-span-3 text-center p-4 bg-gray-100 rounded-md shadow-md">
              <p className="text-gray-600">No hay platos disponibles.</p>
            </div>
          )}
          {listplatosnotfound && ListaPlatos.map((plato) => (
            <div key={plato.id} className="border p-4 rounded-md shadow-md">
              <img src={plato.imagen} alt={plato.nombre} className="w-full h-32 object-cover rounded-md mb-2" />
              <h2 className="text-lg font-semibold">{plato.nombre}</h2>
              <p className="text-gray-600">{plato.descripcion}</p>
              <p className="text-gray-800 font-bold">${plato.precio}</p>
            </div>

          ))}
        </div>


      </ConfiguracionLayout>



    </AppLayout>


  );
}

