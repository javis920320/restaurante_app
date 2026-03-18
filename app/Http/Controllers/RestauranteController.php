<?php

namespace App\Http\Controllers;

use App\Http\Requests\RestauranteRequest;
use App\Models\Restaurante;
use Inertia\Inertia;

class RestauranteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $restaurantes = Restaurante::withCount('mesas')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Restaurantes/Index', [
            'restaurantes' => $restaurantes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RestauranteRequest $request)
    {
        Restaurante::create($request->validated());

        return back()->with('success', 'Restaurante creado exitosamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RestauranteRequest $request, Restaurante $restaurante)
    {
        $restaurante->update($request->validated());

        return back()->with('success', 'Restaurante actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Restaurante $restaurante)
    {
        $restaurante->delete();

        return back()->with('success', 'Restaurante eliminado exitosamente.');
    }
}
