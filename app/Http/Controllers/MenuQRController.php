<?php

namespace App\Http\Controllers;

use App\Services\MesaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuQRController extends Controller
{
    protected MesaService $mesaService;

    public function __construct(MesaService $mesaService)
    {
        $this->mesaService = $mesaService;
    }

    /**
     * Mostrar el menú para una mesa mediante token QR
     *
     * @param string $token
     * @return \Inertia\Response
     */
    public function show(string $token)
    {
        try {
            // Validar el token de la mesa
            $mesa = $this->mesaService->validarToken($token);

            // Obtener el menú disponible agrupado por categorías
            $menuPorCategoria = $this->mesaService->obtenerMenuDisponible($mesa);

            return Inertia::render('MenuQR/Show', [
                'mesa' => [
                    'id' => $mesa->id,
                    'nombre' => $mesa->nombre,
                    'qr_token' => $mesa->qr_token,
                ],
                'restaurante' => [
                    'nombre' => $mesa->restaurante->nombre,
                    'direccion' => $mesa->restaurante->direccion,
                ],
                'menu' => $menuPorCategoria,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('MenuQR/Error', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
