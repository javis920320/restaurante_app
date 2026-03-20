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
            'categorias' => Categoria::withCount('platos')->orderBy('orden')->orderBy('nombre')->get(),
        ]);
    }

    public function create()
    {
        return inertia('Categorias/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias,nombre',
            'orden' => 'nullable|integer|min:0',
            'menu_id' => 'nullable|exists:menus,id',
            'production_area' => 'nullable|string|in:kitchen,bar,none',
        ]);

        $categoria = Categoria::create([
            'nombre' => $request->nombre,
            'orden' => $request->input('orden', 0),
            'menu_id' => $request->input('menu_id'),
            'production_area' => $request->input('production_area', 'none'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Categoria creada con éxito.',
            'categorianew' => $categoria->loadCount('platos'),
        ]);
    }

    /**
     * Toggle active status of a category.
     */
    public function toggleActivo(Categoria $categoria)
    {
        $categoria->update(['activo' => !$categoria->activo]);

        return response()->json([
            'message' => 'Estado actualizado exitosamente.',
            'categoria' => $categoria,
        ]);
    }

    public function destroy(Categoria $categoria)
    {
        // RN-02: No se puede eliminar categoría con productos activos
        if ($categoria->tieneProductosActivos()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar una categoría que tiene productos activos asociados.',
            ], 422);
        }

        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada con éxito.',
        ]);
    }
}
