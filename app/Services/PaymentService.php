<?php

namespace App\Services;

use App\Models\CashMovement;
use App\Models\Payment;
use App\Models\PaymentDetail;
use App\Models\Pedido;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected CajaService $cajaService;

    public function __construct(CajaService $cajaService)
    {
        $this->cajaService = $cajaService;
    }

    /**
     * Record a payment for an order.
     * - Creates a Payment record
     * - Creates CashMovement: ingreso/venta for monto_pagado
     * - If cambio > 0, creates CashMovement: egreso/cambio_entregado for cambio
     * - Updates pedido.payment_status = 'paid'
     *
     * @throws Exception if pedido already paid, or cash register issues
     */
    public function registrarPago(
        int $pedidoId,
        float $montoPagado,
        string $metodoPago,
        int $userId,
        ?int $cashRegisterId = null,
        array $detallesPago = []
    ): Payment {
        $pedido = Pedido::findOrFail($pedidoId);

        if ($pedido->payment_status === 'paid') {
            throw new Exception('El pedido ya está marcado como pagado.');
        }

        $montoTotal = (float) $pedido->total;

        if ($montoPagado < $montoTotal) {
            throw new Exception(
                "El monto pagado ({$montoPagado}) es menor al total del pedido ({$montoTotal})."
            );
        }

        $cambio = round($montoPagado - $montoTotal, 2);

        // Resolve cash register opening (optional — card/transfer may not need one)
        $apertura = null;
        if ($cashRegisterId !== null) {
            $apertura = $this->cajaService->getAperturaActiva($cashRegisterId);
        } else {
            // Try to find any active opening
            $apertura = $this->cajaService->getAperturaActiva();
            if ($apertura) {
                $cashRegisterId = $apertura->cash_register_id;
            }
        }

        return DB::transaction(function () use (
            $pedido, $montoPagado, $montoTotal, $cambio, $metodoPago,
            $userId, $cashRegisterId, $apertura, $detallesPago
        ) {
            $payment = Payment::create([
                'pedido_id'       => $pedido->id,
                'cash_opening_id' => $apertura?->id,
                'monto_total'     => $montoTotal,
                'monto_pagado'    => $montoPagado,
                'cambio'          => $cambio,
                'estado'          => 'pagado',
                'metodo_pago'     => $metodoPago,
                'usuario_id'      => $userId,
                'fecha'           => now(),
            ]);

            // Create payment details for mixed payments
            if ($metodoPago === 'mixto' && !empty($detallesPago)) {
                foreach ($detallesPago as $detalle) {
                    PaymentDetail::create([
                        'payment_id'  => $payment->id,
                        'metodo_pago' => $detalle['metodo_pago'],
                        'monto'       => $detalle['monto'],
                    ]);
                }
            }

            // Record cash movement for the sale income
            if ($cashRegisterId !== null) {
                CashMovement::create([
                    'cash_register_id' => $cashRegisterId,
                    'cash_opening_id'  => $apertura?->id,
                    'tipo'             => 'ingreso',
                    'subtipo'          => 'venta',
                    'monto'            => $montoTotal,
                    'metodo_pago'      => $metodoPago === 'mixto' ? 'efectivo' : $metodoPago,
                    'referencia_id'    => $pedido->id,
                    'descripcion'      => "Pago pedido #{$pedido->id}",
                    'usuario_id'       => $userId,
                    'fecha'            => now(),
                ]);

                // Record the change given back as an egreso
                if ($cambio > 0) {
                    CashMovement::create([
                        'cash_register_id' => $cashRegisterId,
                        'cash_opening_id'  => $apertura?->id,
                        'tipo'             => 'egreso',
                        'subtipo'          => 'cambio_entregado',
                        'monto'            => $cambio,
                        'metodo_pago'      => 'efectivo',
                        'referencia_id'    => $pedido->id,
                        'descripcion'      => "Cambio entregado pedido #{$pedido->id}",
                        'usuario_id'       => $userId,
                        'fecha'            => now(),
                    ]);
                }
            }

            // Mark the order as paid
            $pedido->update(['payment_status' => 'paid']);

            Log::info('Pago registrado', [
                'pedido_id'        => $pedido->id,
                'payment_id'       => $payment->id,
                'monto_total'      => $montoTotal,
                'monto_pagado'     => $montoPagado,
                'cambio'           => $cambio,
                'metodo_pago'      => $metodoPago,
                'cash_register_id' => $cashRegisterId,
                'usuario_id'       => $userId,
            ]);

            return $payment->load('detalles', 'pedido', 'cashOpening');
        });
    }

    /**
     * Get all payments for an order.
     */
    public function getPaymentsByPedido(int $pedidoId): Collection
    {
        return Payment::where('pedido_id', $pedidoId)
            ->with('detalles', 'usuario', 'cashOpening')
            ->orderBy('fecha', 'desc')
            ->get();
    }
}
