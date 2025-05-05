import { Mesa, Plato } from "@/types";
import { use } from "react";

export const ListaPlatos: Plato[] = [
  {
    id: 1,
    nombre: 'Plato 1',
    precio: 10.99,
    descripcion: 'Descripción del plato 1',
    categoria_id: 1,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/f78cf6630b31638994b09b3b470b085c.webp?itok=jCj648zw',
  },
  {
    id: 2,
    nombre: 'Plato 2',
    precio: 12.99,
    categoria_id: 1,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 2',
    imagen: 'https://www.infobae.com/resizer/v2/R4VENSPXO5DZBJ7M5CNWTKEAJQ.jpg?auth=e17bf2694a3eaf395d58a160b09cac133ff395e55f3e48295ed3c66173c5af23&smart=true&width=992&height=558&quality=85',
  },
  {
    id: 3,
    nombre: 'Plato 3',
    precio: 15.99,
    categoria_id: 2,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 3',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/8fdb8c3845fa4f24961cca9c5054e74b.webp?itok=k6V3RJUa',
  },
  {
    id: 4,
    nombre: 'Plato 4',
    precio: 8.99,
    categoria_id: 2,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 4',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/8fdb8c3845fa4f24961cca9c5054e74b.webp?itok=k6V3RJUa',
  },  
  {
    id: 5,
    nombre: 'Plato 5',
    precio: 9.99,
    categoria_id: 3,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 5',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/db6e9762f4287168a9138b0a400c40fd.webp?itok=cec06ZTp',
  },  
  {
    id: 6,
    nombre: 'Plato 6',
    precio: 11.99,
    categoria_id: 3,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 6',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/7151caff1878492a358313035f73b0a6.webp?itok=JvbUf3tj',
  },  

  {
    id: 7,
    nombre: 'Plato 7',
    precio: 14.99,
    categoria_id: 4,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 7',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/8fdb8c3845fa4f24961cca9c5054e74b.webp?itok=k6V3RJUa',
  },  
  {
    id: 8,
    nombre: 'Plato 8',
    precio: 13.99,
    categoria_id: 4,
    created_at: '2023-10-01',
    updated_at: '2023-10-01',
    descripcion: 'Descripción del plato 8',
    imagen: 'https://www.recetasnestle.com.co/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/7151caff1878492a358313035f73b0a6.webp?itok=JvbUf3tj',
  },



];


export const ListaMesas:Mesa[]=[

  {
    id: 1,
    nombre: 'Mesa 1',
    capacidad: 4,
    estado: 'disponible',
  },
  {
    id: 2,
    nombre: 'Mesa 2',
    capacidad: 2,
    estado: 'reservada',
  },
  {
    id: 3,
    nombre: 'Mesa 3',
    capacidad: 6,
    estado: 'ocupada',
  },  

]
 export const ListaPedidosporpedir=[
  {
    id: 1,
    nombre: 'Pedido 1',
    estado: 'pendiente',
    mesa_id: 1,
    platos: [
      { id: 1, nombre: 'Plato 1', cantidad: 2 },
      { id: 2, nombre: 'Plato 2', cantidad: 1 },
      { id: 3, nombre: 'Plato 3', cantidad: 1 },

    ],
    preciototal: 0,
    user_id: 1,
    created_at: '2023-10-01', 
  },
  {
    id: 2,
    nombre: 'Pedido 2',
    estado: 'enviado',
    mesa_id: 2,
    platos: [
      { id: 3, nombre: 'Plato 3', cantidad: 1 },
    ],
  },  
  {
    id: 3,
    nombre: 'Pedido 3',
    estado: 'entregado',
    mesa_id: 3,
    platos: [
      { id: 1, nombre: 'Plato 1', cantidad: 1 },
      { id: 3, nombre: 'Plato 3', cantidad: 2 },
    ],
  },  
  {
    id: 4,
    nombre: 'Pedido 4',
    estado: 'cancelado',
    mesa_id: 1,
    platos: [
      { id: 2, nombre: 'Plato 2', cantidad: 1 },
    ],
  },
  {
    id: 5,
    nombre: 'Pedido 5',
    estado: 'pendiente',
    mesa_id: 2,
    platos: [
      { id: 1, nombre: 'Plato 1', cantidad: 3 },
      { id: 2, nombre: 'Plato 2', cantidad: 2 },
    ],
  },
  {
    id: 6,
    nombre: 'Pedido 6',
    estado: 'enviado',
    mesa_id: 3,
    platos: [
      { id: 3, nombre: 'Plato 3', cantidad: 1 },
    ],
  },
  {
    id: 7,
    nombre: 'Pedido 7',
    estado: 'entregado',
    mesa_id: 1,
    platos: [
      { id: 1, nombre: 'Plato 1', cantidad: 2 },
      { id: 3, nombre: 'Plato 3', cantidad: 1 },
    ],
  },
  {
    id: 8,
    nombre: 'Pedido 8',
    estado: 'cancelado',
    mesa_id: 2,
    platos: [
      { id: 2, nombre: 'Plato 2', cantidad: 1 },
    ],
  },

 ]