<?php

namespace App\Http\Controllers;

use App\Models\Opcion;
use App\Models\Plato;
use Illuminate\Http\Request;

class OpcionController extends Controller
{
    /**
     * Store a new option for a dish.
     */
    public function store(Request $request, Plato $plato)
    {
        $this->authorize('update', $plato);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'precio_extra' => 'required|numeric|min:0|max:999999.99',
            'orden' => 'nullable|integer|min:0',
        ]);

        $opcion = $plato->opciones()->create($validated);

        return response()->json([
            'message' => 'Opción creada exitosamente.',
            'opcion' => $opcion,
        ]);
    }

    /**
     * Update an existing option.
     */
    public function update(Request $request, Plato $plato, Opcion $opcion)
    {
        $this->authorize('update', $plato);

        if ($opcion->plato_id !== $plato->id) {
            abort(404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'precio_extra' => 'required|numeric|min:0|max:999999.99',
            'orden' => 'nullable|integer|min:0',
        ]);

        $opcion->update($validated);

        return response()->json([
            'message' => 'Opción actualizada exitosamente.',
            'opcion' => $opcion,
        ]);
    }

    /**
     * Remove an option.
     */
    public function destroy(Plato $plato, Opcion $opcion)
    {
        $this->authorize('update', $plato);

        if ($opcion->plato_id !== $plato->id) {
            abort(404);
        }

        $opcion->delete();

        return response()->json([
            'message' => 'Opción eliminada exitosamente.',
        ]);
    }
}
