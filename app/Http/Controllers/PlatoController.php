<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductoRequest;
use App\Models\Categoria;
use App\Models\Plato;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Plato::class);

        $categorias = Categoria::all();

        $query = Plato::with(['categoria', 'restaurante']);

        // Filtros opcionales
        if ($request->filled('categoria_id')) {
            $query->porCategoria($request->categoria_id);
        }

        if ($request->filled('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        $platos = $query->orderBy('nombre')->paginate(20);

        return Inertia::render('Platos/Index', [
            'categorias' => $categorias,
            'platos' => $platos,
            'filters' => $request->only(['categoria_id', 'activo']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Plato::class);

        $categorias = Categoria::all();

        return Inertia::render('Platos/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductoRequest $request)
    {
        $this->authorize('create', Plato::class);

        $plato = Plato::create($request->validated());

        return redirect()->route('platos.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Plato $plato)
    {
        $this->authorize('view', $plato);

        $plato->load(['categoria', 'restaurante']);

        return Inertia::render('Platos/Show', [
            'plato' => $plato,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plato $plato)
    {
        $this->authorize('update', $plato);

        $categorias = Categoria::all();

        return Inertia::render('Platos/Edit', [
            'plato' => $plato,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductoRequest $request, Plato $plato)
    {
        $this->authorize('update', $plato);

        $plato->update($request->validated());

        return response()->json([
            'message' => 'Producto actualizado exitosamente.',
            'plato' => $plato,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plato $plato)
    {
        $this->authorize('delete', $plato);

        $plato->delete();

        return redirect()->route('platos.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Toggle product active status.
     */
    public function toggleActivo(Plato $plato)
    {
        $this->authorize('update', $plato);

        $plato->update(['activo' => !$plato->activo]);

        return response()->json([
            'message' => 'Estado actualizado exitosamente.',
            'plato' => $plato,
        ]);
    }
}
