import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {ListaPlatos} from "../muckups/data"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';

export default function Welcome({categorias}: { categorias: any[] }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                            <Link href={route('login')}>
                            Reservar Salones
                            </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <section className='flex flex-col items-center  justify-center gap-4  p-8' style={{ 
                    backgroundImage: 'url(images/fondo.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    
                 }}>
                    <h1 className="mb-6 text-3xl font-bold">Bienvenido a la Aplicación de Pedidos</h1>  
                            <ul className=" flex space-x-1">
                                {Array.isArray(categorias) && categorias.map((categoria: any) => (
                                    <li key={categoria.id} className='p-2 bg-gray-200 rounded-2xl hover:bg-amber-300 hover:text-white cursor-pointer'>    
                                        <h2 className='text-center  '>{categoria.nombre}</h2>
                                     
                                       
                                    </li>
                                ))} 
                                </ul>
                                
                                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 ">
                                
                                {Array.isArray(ListaPlatos) && ListaPlatos.map((plato: any) => (
                                    <Card key={plato.id} className='w-[300px] h-64   rounded-lg' >
                                        <CardContent>
                                        <img src={plato.imagen} alt={plato.nombre} className='w-full h-32 object-cover rounded-t-lg' />
                                        </CardContent>


                                        <CardTitle>
                                        <h2 className='text-center'>{plato.nombre}</h2>
                                        </CardTitle>
                                        
                                        <CardFooter className='flex flex-col items-center'>
                                            <p>{plato.descripcion}</p>
                                            <p className='text-2xl'>${plato.precio.toFixed(2)}</p>
                                        </CardFooter>
                                        
                                        </Card> 
                                ))}
                                </section>

                   
                    
                </section>    
                
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
