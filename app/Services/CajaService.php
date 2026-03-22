<?php

namespace App\Services;

use App\Models\CashClosing;
use App\Models\CashMovement;
use App\Models\CashOpening;
use App\Models\CashRegister;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CajaService
{
    /**
     * Get the currently open cash register session for a register, or null.
     */
    public function getAperturaActiva(?int $cashRegisterId = null): ?CashOpening
    {
        $query = CashOpening::where('estado', 'abierta');

        if ($cashRegisterId !== null) {
            $query->where('cash_register_id', $cashRegisterId);
        }

        return $query->latest('fecha_apertura')->first();
    }

    /**
     * Open a cash register.
     * Creates a CashOpening record and sets the register estado = 'abierta'.
     *
     * @throws Exception if register is already open
     */
    public function abrirCaja(int $cashRegisterId, int $userId, float $montoInicial): CashOpening
    {
        $registro = CashRegister::findOrFail($cashRegisterId);

        if ($registro->estado === 'abierta') {
            throw new Exception('La caja ya está abierta.');
        }

        return DB::transaction(function () use ($registro, $userId, $montoInicial) {
            $apertura = CashOpening::create([
                'cash_register_id' => $registro->id,
                'usuario_id'       => $userId,
                'monto_inicial'    => $montoInicial,
                'fecha_apertura'   => now(),
                'estado'           => 'abierta',
            ]);

            $registro->update([
                'estado'     => 'abierta',
                'usuario_id' => $userId,
            ]);

            // Record the initial balance as an ingreso movement
            CashMovement::create([
                'cash_register_id' => $registro->id,
                'cash_opening_id'  => $apertura->id,
                'tipo'             => 'ingreso',
                'subtipo'          => 'ingreso_manual',
                'monto'            => $montoInicial,
                'metodo_pago'      => 'efectivo',
                'usuario_id'       => $userId,
                'descripcion'      => 'Monto inicial de apertura',
                'fecha'            => now(),
            ]);

            Log::info('Caja abierta', [
                'cash_register_id' => $registro->id,
                'apertura_id'      => $apertura->id,
                'monto_inicial'    => $montoInicial,
                'usuario_id'       => $userId,
            ]);

            return $apertura->load('cashRegister', 'usuario');
        });
    }

    /**
     * Close a cash register session.
     * - Calculates monto_teorico = monto_inicial + ingresos - egresos
     * - Creates CashClosing record
     * - Sets opening estado = 'cerrada'
     * - Sets register estado = 'cerrada'
     *
     * @throws Exception if no active opening found for this register
     */
    public function cerrarCaja(int $cashRegisterId, int $userId, float $montoReal, ?string $notas = null): CashClosing
    {
        $apertura = $this->getAperturaActiva($cashRegisterId);

        if (!$apertura) {
            throw new Exception('No se encontró una apertura activa para esta caja.');
        }

        return DB::transaction(function () use ($apertura, $userId, $montoReal, $notas) {
            $resumen      = $this->getResumenApertura($apertura);
            $montoTeorico = $resumen['monto_teorico'];
            $diferencia   = $montoReal - $montoTeorico;

            $cierre = CashClosing::create([
                'cash_opening_id' => $apertura->id,
                'monto_teorico'   => $montoTeorico,
                'monto_real'      => $montoReal,
                'diferencia'      => $diferencia,
                'fecha_cierre'    => now(),
                'notas'           => $notas,
            ]);

            $apertura->update(['estado' => 'cerrada']);

            $apertura->cashRegister->update(['estado' => 'cerrada']);

            Log::info('Caja cerrada', [
                'cash_register_id' => $apertura->cash_register_id,
                'apertura_id'      => $apertura->id,
                'cierre_id'        => $cierre->id,
                'monto_teorico'    => $montoTeorico,
                'monto_real'       => $montoReal,
                'diferencia'       => $diferencia,
                'usuario_id'       => $userId,
            ]);

            return $cierre->load('apertura');
        });
    }

    /**
     * Record a manual cash movement (income or expense).
     * Requires an active opening.
     */
    public function registrarMovimiento(
        int $cashRegisterId,
        string $tipo,
        string $subtipo,
        float $monto,
        string $metodoPago = 'efectivo',
        ?int $userId = null,
        ?string $descripcion = null,
        ?int $referenciaId = null
    ): CashMovement {
        $apertura = $this->getAperturaActiva($cashRegisterId);

        if (!$apertura) {
            throw new Exception('No hay una apertura activa para registrar movimientos en esta caja.');
        }

        return DB::transaction(function () use (
            $cashRegisterId, $apertura, $tipo, $subtipo, $monto,
            $metodoPago, $userId, $descripcion, $referenciaId
        ) {
            $movimiento = CashMovement::create([
                'cash_register_id' => $cashRegisterId,
                'cash_opening_id'  => $apertura->id,
                'tipo'             => $tipo,
                'subtipo'          => $subtipo,
                'monto'            => $monto,
                'metodo_pago'      => $metodoPago,
                'usuario_id'       => $userId,
                'descripcion'      => $descripcion,
                'referencia_id'    => $referenciaId,
                'fecha'            => now(),
            ]);

            Log::info('Movimiento de caja registrado', [
                'cash_register_id' => $cashRegisterId,
                'movimiento_id'    => $movimiento->id,
                'tipo'             => $tipo,
                'subtipo'          => $subtipo,
                'monto'            => $monto,
                'usuario_id'       => $userId,
            ]);

            return $movimiento;
        });
    }

    /**
     * Get movements for the active opening, or all movements for a register.
     * Returns recent movements ordered by fecha DESC.
     */
    public function getMovimientos(int $cashRegisterId, ?int $openingId = null, int $limit = 50): Collection
    {
        $query = CashMovement::where('cash_register_id', $cashRegisterId)
            ->with('usuario')
            ->orderBy('fecha', 'desc');

        if ($openingId !== null) {
            $query->where('cash_opening_id', $openingId);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get summary for an opening (totals by tipo).
     *
     * @return array{monto_inicial: float, total_ingresos: float, total_egresos: float, saldo_actual: float, monto_teorico: float}
     */
    public function getResumenApertura(CashOpening $apertura): array
    {
        $movimientos = CashMovement::where('cash_opening_id', $apertura->id)->get();

        // Exclude the initial balance movement to avoid double-counting
        $ingresos = $movimientos
            ->where('tipo', 'ingreso')
            ->where('subtipo', '!=', 'ingreso_manual')
            ->sum('monto');

        // Include manual incomes that are not the opening entry
        $ingresosManualesTotales = CashMovement::where('cash_opening_id', $apertura->id)
            ->where('tipo', 'ingreso')
            ->where('subtipo', 'ingreso_manual')
            ->where('descripcion', '!=', 'Monto inicial de apertura')
            ->sum('monto');

        $totalIngresos = $ingresos + $ingresosManualesTotales;

        $totalEgresos = $movimientos->where('tipo', 'egreso')->sum('monto');

        $montoInicial  = (float) $apertura->monto_inicial;
        $saldoActual   = $montoInicial + $totalIngresos - $totalEgresos;
        $montoTeorico  = $saldoActual;

        return [
            'monto_inicial'   => $montoInicial,
            'total_ingresos'  => (float) $totalIngresos,
            'total_egresos'   => (float) $totalEgresos,
            'saldo_actual'    => (float) $saldoActual,
            'monto_teorico'   => (float) $montoTeorico,
        ];
    }

    /**
     * List all cash registers with their current status.
     */
    public function getCashRegisters(): Collection
    {
        return CashRegister::with('aperturaActual.usuario', 'usuario')->get();
    }
}
