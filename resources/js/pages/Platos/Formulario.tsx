import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from '@inertiajs/react'
import React from 'react'
import axios from "axios"

export default function  Formulario  ({ categorias }: { categorias: { id: number; nombre: string }[] })  {
      const { data, setData, errors, setError, post, processing } = useForm({
        nombre: '',
        precio: 0,
        descripcion: '',
        categoria_id: 0,
        imagen: null,
      });
      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
            const respuesta = await axios.post(route("platos.store"), { nombre: data.nombre, precio: data.precio, descripcion: data.descripcion, categoria_id: data.categoria_id, imagen: data.imagen })
      
            if (respuesta.status === 200) {
              setData({ nombre: '', precio: 0, descripcion: '', categoria_id: 0, imagen: null });
              
      
            } else {
      
              // Maneja el error aquí
            }
          } catch (error: any) {
            if (error.response && error.response.data.errors) {
              const backendErrors = error.response.data.errors;
              Object.keys(backendErrors).forEach((key: any) => {
                setError(key, backendErrors[key][0]); // Establece el error en el campo correspondiente
              });
      
            }
      
          }
      
        }



  return (
    <form onSubmit={handleSubmit}>
    <InputError message={errors.nombre} />
    <div className=' grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <Input
        className='col-span-2'
        placeholder='Nombre del plato'
        value={data.nombre}
        onChange={(e) => setData('nombre', e.target.value)}

      ></Input>
      <Input type='number'
        placeholder='Precio del plato'
        value={data.precio}
        onChange={(e) => setData('precio', parseFloat(e.target.value))}

      ></Input>
    </div>
    <Select onValueChange={(value) => setData("categoria_id", parseInt(value))} >

      <SelectTrigger className="w-full mt-2" >
        <SelectValue placeholder="Selecciona una categoria" />
        <SelectContent>
          {categorias.map((categoria) => (
            <SelectItem key={categoria.id} value={categoria.id.toString()}>{categoria.nombre}</SelectItem>
          ))}
        </SelectContent>
      </SelectTrigger>
    </Select>

    <div className=' my-2'>
      <textarea className=" p-2 rounded-2xl w-full border-1 " placeholder="Descripción del plato" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)}></textarea>
    </div>
    <Button type="submit" disabled={processing} className="bg-blue-500 text-white rounded-md px-4 py-2 mt-4"> Nuevo Plato</Button>
  </form>
  )
}

