<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return inertia('Categorias/Index', [
            'categorias' => Categoria::withCount('platos')->get(),
        ]);
    }

    public function create()
    {
        return inertia('Categorias/Create');
    }

    public function store(Request $request)
    {
        
        $request->validate([
            'nombre' => 'required|string|max:255 |unique:categorias,nombre',    
        ]);

        $categoria=Categoria::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Categoria creada con éxito.',
            "categorianew"=>$categoria
        ]); 
    }
    
    public function destroy(Categoria $categoria)
    {
        $categoria->delete();
        return back();  
    }   
}
