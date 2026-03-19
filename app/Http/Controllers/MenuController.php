<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Restaurante;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with('restaurante')
            ->withCount('categorias')
            ->orderBy('created_at', 'desc')
            ->get();

        $restaurantes = Restaurante::activos()->get();

        return Inertia::render('Menus/Index', [
            'menus' => $menus,
            'restaurantes' => $restaurantes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurante_id' => 'required|exists:restaurantes,id',
            'nombre' => 'required|string|max:255',
            'estado' => 'in:borrador,publicado',
        ]);

        $menu = Menu::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menú creado con éxito.',
            'menu' => $menu->load('restaurante')->loadCount('categorias'),
        ], 201);
    }

    public function show(Menu $menu)
    {
        $menu->load(['restaurante', 'categorias' => function ($query) {
            $query->orderBy('orden')->orderBy('nombre')
                ->withCount('platos')
                ->with(['platos' => function ($q) {
                    $q->orderBy('orden')->orderBy('nombre');
                }]);
        }]);

        $restaurantes = Restaurante::activos()->get();

        return Inertia::render('Menus/Show', [
            'menu' => $menu,
            'restaurantes' => $restaurantes,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'restaurante_id' => 'sometimes|exists:restaurantes,id',
            'nombre' => 'sometimes|required|string|max:255',
            'estado' => 'sometimes|in:borrador,publicado',
        ]);

        // RN-04: Un menú publicado debe tener al menos una categoría activa
        if (isset($validated['estado']) && $validated['estado'] === 'publicado') {
            $tieneCategoriasActivas = $menu->categorias()->where('activo', true)->exists();
            if (!$tieneCategoriasActivas) {
                return response()->json([
                    'success' => false,
                    'message' => 'El menú debe tener al menos una categoría activa para ser publicado.',
                ], 422);
            }
        }

        $menu->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Menú actualizado con éxito.',
            'menu' => $menu->load('restaurante')->loadCount('categorias'),
        ]);
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menú eliminado con éxito.',
        ]);
    }

    public function toggleEstado(Menu $menu)
    {
        $nuevoEstado = $menu->estado === 'publicado' ? 'borrador' : 'publicado';

        // RN-04: Un menú publicado debe tener al menos una categoría activa
        if ($nuevoEstado === 'publicado') {
            $tieneCategoriasActivas = $menu->categorias()->where('activo', true)->exists();
            if (!$tieneCategoriasActivas) {
                return response()->json([
                    'success' => false,
                    'message' => 'El menú debe tener al menos una categoría activa para ser publicado.',
                ], 422);
            }
        }

        $menu->update(['estado' => $nuevoEstado]);

        return response()->json([
            'success' => true,
            'message' => 'Estado del menú actualizado.',
            'menu' => $menu->load('restaurante')->loadCount('categorias'),
        ]);
    }

    public function generarQR(Menu $menu)
    {
        $url = url('/menu-publico/' . $menu->slug);

        return response()->json([
            'success' => true,
            'url' => $url,
            'slug' => $menu->slug,
        ]);
    }
}
