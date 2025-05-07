<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\Plato;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id', 
            'mesa_id' => 'required|exists:mesas,id',
            'plato_id' => 'required|exists:platos,id',
            'cantidad' => 'required|integer|min:1',
        ]);

        // Crear el pedido en la base de datos
        $pedido = Pedido::create($request->all());

        return response()->json([
            'message' => 'Pedido creado exitosamente.',
            'pedido' => $pedido,
        ]);
    }   
    public function create(Mesa $mesa){
        //verificar si la mesa esta disponible
        if(!$mesa->estado=="disponible"){
            return redirect()->route("dashboard")->with("error","La mesa no esta disponible");
        }   
        //verificar si la mesa tiene un pedido activo   
        $pedido=Pedido::where("mesa_id",$mesa->id)->where("estado","activo")->first();
        if($pedido){
            return redirect()->route("dashboard")->with("error","La mesa ya tiene un pedido activo");
        }

        //verificar si la mesa tiene reservas
        /* $reserva=$mesa->reservas()->where("estado","activo")->first();
        if($reserva){
            return redirect()->route("dashboard")->with("error","La mesa tiene una reserva activa");
        }   
 */
       //traer platos con categorias
        $platos=Plato::with("categoria")->get();    

       


        
        return Inertia("Pedidos/Principal",[
            "mesa"=>$mesa,
            "platos"=>$platos,  
            

        ]);

    }
    public function show(){

    }
}
