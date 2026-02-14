<?php

namespace App\Services;

use App\Models\Mesa;
use Illuminate\Support\Facades\Log;
use Exception;

class MesaService
{
    /**
     * Validar token QR de una mesa
     *
     * @param string $token
     * @return Mesa|null
     * @throws Exception
     */
    public function validarToken(string $token): ?Mesa
    {
        $mesa = Mesa::porToken($token)
            ->activas()
            ->with('restaurante')
            ->first();

        if (!$mesa) {
            Log::warning('Intento de acceso con token inválido', ['token' => $token]);
            throw new Exception('Token de mesa inválido o mesa inactiva.');
        }

        if (!$mesa->restaurante || !$mesa->restaurante->activo) {
            Log::warning('Intento de acceso a restaurante inactivo', ['mesa_id' => $mesa->id]);
            throw new Exception('El restaurante no está disponible actualmente.');
        }

        return $mesa;
    }

    /**
     * Ocupar una mesa
     *
     * @param Mesa $mesa
     * @return bool
     */
    public function ocuparMesa(Mesa $mesa): bool
    {
        if ($mesa->estado === 'ocupada') {
            return false;
        }

        $mesa->estado = 'ocupada';
        $mesa->save();

        Log::info('Mesa ocupada', ['mesa_id' => $mesa->id, 'nombre' => $mesa->nombre]);

        return true;
    }

    /**
     * Liberar una mesa
     *
     * @param Mesa $mesa
     * @return bool
     */
    public function liberarMesa(Mesa $mesa): bool
    {
        $mesa->estado = 'disponible';
        $mesa->save();

        Log::info('Mesa liberada', ['mesa_id' => $mesa->id, 'nombre' => $mesa->nombre]);

        return true;
    }

    /**
     * Obtener el menú disponible para una mesa
     *
     * @param Mesa $mesa
     * @return array
     */
    public function obtenerMenuDisponible(Mesa $mesa): array
    {
        $platos = $mesa->restaurante
            ->platos()
            ->activos()
            ->with('categoria')
            ->orderBy('categoria_id')
            ->orderBy('nombre')
            ->get();

        return $platos->groupBy('categoria.nombre')->toArray();
    }
}
