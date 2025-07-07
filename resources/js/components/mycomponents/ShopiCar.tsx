
import { ShoppingCart } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'

import CarritoCompras from '@/pages/Pedidos/Carritocompras';

const ShopiCar = () => {
    // Aquí puedes manejar el estado del carrito, por ejemplo, usando useState
    const [isOpen, setIsOpen] = React.useState(false);
    const toggleCart = () => {
        setIsOpen(!isOpen);
    };

    // const [cartItems, setCartItems] = React.useState([]);
    // const totalItems = cartItems.length; // O cualquier lógica para contar los artículos en el carrito
    // const handleCartClick = () => {
    //     // Lógica para manejar el clic en el carrito
    // };


  return (
   <>
     <Button  className='absolute right-4 text-sm ' onClick={toggleCart} data-collapsible='icon/sidebar-wrapper'>
                <ShoppingCart/> Carrito (0)
            
                </Button>
                {
                    isOpen && (
                        <>
                        <div className="  fixed inset-0 bg-black/50 z-40" onClick={toggleCart}></div>
                    <div className="fixed right-0 top-0 min-width-50 h-full max-w-full bg-white shadow-lg z-50 p-4 sm:w-130  sm:rounded-none">
                        <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
                        <CarritoCompras/>
                        <Button className=" absolute top-0 right-2 opacity-40" onClick={toggleCart} >X</Button>
                        </div>
                        
</>

                    )
                }
                
               
   </>
  )
}

export default ShopiCar