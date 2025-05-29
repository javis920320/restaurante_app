import { useState } from "react"

export function useCategorys({categorias}: { categorias: { id: number; nombre: string }[] }) { 
    const [filterCategoria,setFilterCategoria]=useState<{ id: number; nombre: string }[]>([]);
    const handleFilter=(categoriaId:number)=>{
        
        setFilterCategoria((prevCategorias) => {
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

            return nuevasCategorias; // Actualizamos el estado de las categorías seleccionadas
        }); 
    }


return{
    handleFilter,
    filterCategoria

}

}