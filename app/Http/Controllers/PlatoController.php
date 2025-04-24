<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Plato;
use Illuminate\Http\Request;

class PlatoController extends Controller
{
    
    public function index()
    {
        $categorias=Categoria::all(); 
        return inertia('Platos/Index',[
            "categorias"=>$categorias,
            "platos"=>Plato::with('categoria')->get(),  
        ]);
    }  
    
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'nombre' => 'required|string|max:255|unique:platos,nombre', 
            "descripcion" => 'nullable|string|max:1000',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'precio' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        // Crear el plato en la base de datos
        $plato = Plato::create($request->all());

        return redirect()->route('platos.index')->with('success', 'Plato creado exitosamente.');
    }  
    
    
    public function update(Request $request, Plato $plato)     {
        // Validar los datos de entrada
        $request->validate([
            'nombre' => 'required|string|max:255',
            "descripcion" => 'nullable|string|max:1000',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'precio' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        // Actualizar el plato en la base de datos
        //$plato = Plato::findOrFail($request->id);
        $plato->update($request->all());

        //return redirect()->route('platos.index')->with('success', 'Plato actualizado exitosamente.');   
        return response()->json([
            'message' => 'Plato actualizado exitosamente.',
            'plato' => $plato,
        ]); 
    }
    
}
