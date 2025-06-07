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
        // Validar los datos de entrada
        $request->validate([
            'nombre' => 'required|string|max:255|unique:mesas,nombre', // Cambiado a unique para nombre
            "capacidad" => 'required|integer|min:1',
            'ubicacion' => 'required|in:Interior,Exterior,Patio,Balcón,Jardín,Barra,Terraza,VIP,Zona de fumadores', // Cambiado a enum para ubicacion   
            'estado' => 'required|in:disponible,ocupada', // Cambiado a enum para estado

        ]);

        // Crear la mesa en la base de datos
        $mesa = Mesa::create($request->all());
        return response()->json([
            'message' => 'Mesa creada exitosamente.',
            'nuevaMesa' => $mesa,
        ]);

    }
    public function show(Mesa $mesa)
    {
     $pedidos=Pedido::where('mesa_id', $mesa->id)->get();
     

        // Mostrar los detalles de una mesa específica 

        return Inertia::render('Mesas/Show', [
            'mesa' => $mesa,
            'pedidos' => $pedidos,  
        ]);
    }
}
