<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
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
}
