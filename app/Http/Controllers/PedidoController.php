<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\Plato;
use Illuminate\Http\Request;

class PedidoController extends Controller
{

    public function store(Request $request)
    {

        //obtener el id del usuario autenticado
        $user_id = auth()->user()->id;
        //pasarselo al request
        $request->merge(['user_id' => $user_id]);



        // Validar los datos de entrada
        $request->validate([
            'cliente_id' => 'nullable',
            "user_id" => 'required|exists:users,id',
            'estado' => 'required|in:pendiente,en concina,servido,pagado', // Estado del pedido
            // Validar los items del pedido      
            'items' => 'required|array',
            'items.*.plato_id' => 'required|exists:platos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio' => 'required|numeric|min:0',

            'mesa_id' => 'required|exists:mesas,id',


        ]);

        // Crear el pedido en la base de datos
        $pedido = Pedido::create($request->all());

        foreach ($request->items as $item) {
            $pedido->item()->create([
                'plato_id' => $item['plato_id'],
                'cantidad' => $item['cantidad'],
                'precio' => $item['precio'],
                'total' => $item['precio'] * $item['cantidad'],
            ]);
        }
        //cambiar estado de la mesa a ocupado
        $mesa = Mesa::find($request->mesa_id);
        $mesa->estado = 'ocupada';
        $mesa->save();

        return response()->json([
            'message' => 'Pedido creado exitosamente.',
            'pedido' => $pedido,
        ]);
    }
    public function create(Mesa $mesa)
    {
        //verificar si la mesa esta disponible
        if (!$mesa->estado == "disponible") {
            return redirect()->route("dashboard")->with("error", "La mesa no esta disponible");
        }
        //verificar si la mesa tiene un pedido activo   
        $pedido = Pedido::where("mesa_id", $mesa->id)->where("estado", "activo")->first();
        if ($pedido) {
            return redirect()->route("dashboard")->with("error", "La mesa ya tiene un pedido activo");
        }

        $platos = Plato::with("categoria")->get();

        $categorias = Categoria::all();



        return Inertia("Pedidos/Principal", [
            "mesa" => $mesa,
            "platos" => $platos,
            "categorias" => $categorias,


        ]);

    }
    public function show()
    {

    }
    public function cocina()
    {
        //traer los pedidos que se encuentran en cocina
        $pedidos = Pedido::where("estado", "en concina")->with(["mesa", "user", "item"])->get();

        return Inertia("Pedidos/Cocina", [
            "pedidos" => $pedidos,


        ]);
    }
}
