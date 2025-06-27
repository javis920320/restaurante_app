<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MesaController extends Controller
{

    public function index(Request $request)
    {
        // Obtener todas las mesas de la base de datos
        $mesas = Mesa::all();
        return Inertia::render('Mesas/Mesas', [
            'mesas' => $mesas,
        ]);
    }

    public function store(Request $request)
    {

        $request->validate([
            'nombre' => 'required|string|max:255|unique:mesas,nombre', 
            "capacidad" => 'required|integer|min:1',
            'ubicacion' => 'required|in:Interior,Exterior,Patio,Balcón,Jardín,Barra,Terraza,VIP,Zona de fumadores',
            'estado' => 'required|in:disponible,ocupada,reservada', 

        ]);   
        $mesa = Mesa::create($request->all());
        return response()->json([
            'message' => 'Mesa creada exitosamente.',
            'nuevaMesa' => $mesa,
        ]);

    }
    public function show(Mesa $mesa)
    {
        // Verificar si la mesa existe
        if (!$mesa) {
            return redirect()->route('mesas.index')->with('error', 'Mesa no encontrada.');
        }
        // Verificar si la mesa tiene un pedido asociado
        if (!$mesa->pedido) {
            return redirect()->route('mesas.index')->with('error', 'No hay pedidos asociados a esta mesa.');
        }
        // Si la mesa tiene un pedido, se obtiene el pedido asociado
        // Obtener los pedidos asociados a la mesa
     $pedidos=Pedido::where('mesa_id', $mesa->id)->get(); 

        return Inertia::render('Mesas/Show', [
            'mesa' => $mesa,
            'pedidos' => $pedidos,  
        ]);
    }

    public function  update(Request $request, Mesa $mesa)
    {
        // Validar los datos de entrada
        $request->validate([
            'nombre' => 'required|string|max:255|unique:mesas,nombre,' . $mesa->id,
            'capacidad' => 'required|integer|min:1',
            'ubicacion' => 'required|in:Interior,Exterior,Patio,Balcón,Jardín,Barra,Terraza,VIP,Zona de fumadores',
            'estado' => 'required|in:disponible,ocupada,reservada',
        ]);

        // Actualizar la mesa
        $mesa->update($request->all());

        return response()->json([
            'message' => 'Mesa actualizada exitosamente.',
            'mesaActualizada' => $mesa,
        ]);
    }   
}
