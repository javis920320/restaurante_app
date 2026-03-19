<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Inertia\Inertia;

class MenuPublicoController extends Controller
{
    public function show(string $slug)
    {
        $menu = Menu::where('slug', $slug)
            ->where('estado', 'publicado')
            ->with(['restaurante', 'categorias' => function ($query) {
                $query->where('activo', true)
                    ->orderBy('orden')
                    ->orderBy('nombre')
                    ->with(['platos' => function ($q) {
                        $q->where('activo', true)
                            ->orderBy('orden')
                            ->orderBy('nombre');
                    }]);
            }])
            ->first();

        if (!$menu) {
            abort(404, 'Menú no encontrado o no disponible.');
        }

        return Inertia::render('MenuPublico/Show', [
            'menu' => $menu,
        ]);
    }
}
