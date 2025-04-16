import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import ConfiguracionLayout from '@/layouts/configuracion/layout';
import { type BreadcrumbItem } from '@/types';  
import { type Categoria } from '@/types'; // Asegúrate de que la ruta sea correcta  
import { FormEventHandler, useState } from 'react';
import { Value } from '@radix-ui/react-select';
import InputError from '@/components/input-error';
import axios from 'axios';  


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categorias',
        href: '/categorias',
    },
];
export default function CategoriasIndex({categorias}:{categorias: Categoria[]}) {   

const[listCategorias,setCategorias]=useState<Categoria[]>(categorias) // Estado para las categorías
    const categoriaExist=listCategorias.length>0?true:false; // Verifica si hay categorías 
  const{post,setData,data,errors,setError, delete:destroy}= useForm({
   nombre:""
  })
  const CategoriaNueva:FormEventHandler=async(e)=>{
    e.preventDefault();
    try {
        const response=  await axios.post(route('categorias.store'), { nombre: data.nombre })      

        setCategorias((prev) => [...prev, response.data.categorianew]); // Agrega la nueva categoría
        setData("nombre", ""); // Limpia el campo de entrada
    } catch (error) {
        console.log(error.response.data.message)
        //console.log(error.response?.data?.errors || error.message);
       setError("nombre", error.response.data.message);  
    }
  

 
    
  }
  const eliminarCategoria=(id:number)=>{
    // Aquí puedes agregar la lógica para eliminar la categoría
    // Por ejemplo, puedes hacer una solicitud POST a tu backend para eliminar la categoría
    destroy(route('categorias.destroy', id), {
        preserveScroll: true,
        onSuccess: () => {
            setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
        },
        onError: (errors) => {
            console.log(errors);
        },
    }); 
  }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <ConfiguracionLayout>

            <div className="p-4">
                <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
                <p className="mt-2 text-gray-600">
                    Aquí puedes gestionar las categorías de los platos.
                    </p>


                    {categoriaExist&&(
                        <div>
                            

                            <form onSubmit={CategoriaNueva} className="flex items-center mt-4"> 
                                <input type="text" placeholder="Nueva Categoria..." className="p-2 border rounded-md" onChange={(e)=>setData("nombre",e.target.value)} value={data.nombre}/>
                                <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded-md">Agregar +</button>  
                              
                                

                            </form>
                            <div><InputError message={errors.nombre} /></div>
                            <h2 className="text-xl font-semibold">Lista de Categorías</h2>  
                            <ul className="mt-2 space-y-2">
                                {listCategorias.map((categoria) => (
                                    <li key={categoria.id} className="flex justify-between p-2 border rounded-md">
                                        <span>{categoria.nombre}</span>
                                        <button className="text-red-500 hover:text-red-700" onClick={(e) =>eliminarCategoria(categoria.id) }>
                                            Eliminar </button>     
                                    </li>
                                ))}
                                </ul>
                        </div>

    )}              
            </div>
            </ConfiguracionLayout>
        </AppLayout>
    );
}
