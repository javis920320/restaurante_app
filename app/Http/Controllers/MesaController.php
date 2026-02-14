<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\MesaRequest;
use App\Models\Mesa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MesaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Mesa::class);

        $mesas = Mesa::with('restaurante')
            ->orderBy('nombre')
            ->paginate(20);

        return Inertia::render('Mesas/Index', [
            'mesas' => $mesas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Mesa::class);

        return Inertia::render('Mesas/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MesaRequest $request)
    {
        $this->authorize('create', Mesa::class);

        $mesa = Mesa::create($request->validated());

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa creada exitosamente. Token QR: ' . $mesa->qr_token);
    }

    /**
     * Display the specified resource.
     */
    public function show(Mesa $mesa)
    {
        $this->authorize('view', $mesa);

        $mesa->load(['restaurante', 'pedidos' => function ($query) {
            $query->activos()->with('detalles.producto');
        }]);

        return Inertia::render('Mesas/Show', [
            'mesa' => $mesa,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Mesa $mesa)
    {
        $this->authorize('update', $mesa);

        return Inertia::render('Mesas/Edit', [
            'mesa' => $mesa,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MesaRequest $request, Mesa $mesa)
    {
        $this->authorize('update', $mesa);

        $mesa->update($request->validated());

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Mesa $mesa)
    {
        $this->authorize('delete', $mesa);

        $mesa->delete();

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa eliminada exitosamente.');
    }

    /**
     * Generate QR code for a table.
     */
    public function generarQR(Mesa $mesa)
    {
        $this->authorize('view', $mesa);

        // URL del menú con el token de la mesa
        $url = route('menu.qr', ['token' => $mesa->qr_token]);

        // Generar el código QR como SVG
        $qrCode = QrCode::size(300)
            ->format('svg')
            ->generate($url);

        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml');
    }
}
