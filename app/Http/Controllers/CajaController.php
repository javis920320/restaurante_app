<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CashRegister;
use App\Models\Pedido;
use App\Services\CajaService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CajaController extends Controller
{
    protected CajaService $cajaService;
    protected PaymentService $paymentService;

    public function __construct(CajaService $cajaService, PaymentService $paymentService)
    {
        $this->cajaService    = $cajaService;
        $this->paymentService = $paymentService;
    }

    /**
     * GET /admin/caja/registros - list all cash registers.
     */
    public function index(): JsonResponse
    {
        $registros = $this->cajaService->getCashRegisters();

        return response()->json([
            'registros' => $registros,
        ]);
    }

    /**
     * POST /admin/caja/registros - create a new cash register.
     * Body: { nombre: string }
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
        ]);

        $registro = CashRegister::create([
            'nombre' => $request->nombre,
            'estado' => 'cerrada',
        ]);

        return response()->json([
            'message'  => 'Registro de caja creado exitosamente.',
            'registro' => $registro,
        ], 201);
    }

    /**
     * GET /admin/caja/registros/{cashRegister} - get a single register with active opening info.
     */
    public function show(CashRegister $cashRegister): JsonResponse
    {
        $cashRegister->load('aperturaActual.usuario', 'usuario');

        $apertura = $cashRegister->aperturaActual;
        $resumen  = $apertura ? $this->cajaService->getResumenApertura($apertura) : null;

        return response()->json([
            'registro' => $cashRegister,
            'resumen'  => $resumen,
        ]);
    }

    /**
     * POST /admin/caja/registros/{cashRegister}/abrir - open the register.
     * Body: { monto_inicial: float }
     */
    public function abrir(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $request->validate([
            'monto_inicial' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $apertura = $this->cajaService->abrirCaja(
                cashRegisterId: $cashRegister->id,
                userId: Auth::id(),
                montoInicial: (float) $request->monto_inicial
            );

            return response()->json([
                'message'  => 'Caja abierta exitosamente.',
                'apertura' => $apertura,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al abrir la caja.',
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /admin/caja/registros/{cashRegister}/cerrar - close the register.
     * Body: { monto_real: float, notas?: string }
     */
    public function cerrar(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $request->validate([
            'monto_real' => ['required', 'numeric', 'min:0'],
            'notas'      => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $cierre = $this->cajaService->cerrarCaja(
                cashRegisterId: $cashRegister->id,
                userId: Auth::id(),
                montoReal: (float) $request->monto_real,
                notas: $request->notas
            );

            return response()->json([
                'message' => 'Caja cerrada exitosamente.',
                'cierre'  => $cierre,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cerrar la caja.',
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /admin/caja/registros/{cashRegister}/movimientos - list movements.
     */
    public function movimientos(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $apertura  = $this->cajaService->getAperturaActiva($cashRegister->id);
        $openingId = $request->query('opening_id') ?? $apertura?->id;
        $limit     = (int) $request->query('limit', 50);

        $movimientos = $this->cajaService->getMovimientos(
            cashRegisterId: $cashRegister->id,
            openingId: $openingId ? (int) $openingId : null,
            limit: $limit
        );

        return response()->json([
            'movimientos' => $movimientos,
            'apertura_id' => $openingId,
        ]);
    }

    /**
     * POST /admin/caja/registros/{cashRegister}/movimientos - record a manual movement.
     * Body: { tipo, subtipo, monto, metodo_pago?, descripcion? }
     */
    public function registrarMovimiento(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $request->validate([
            'tipo'        => ['required', 'string', 'in:' . implode(',', \App\Models\CashMovement::TIPOS)],
            'subtipo'     => ['required', 'string', 'in:' . implode(',', \App\Models\CashMovement::SUBTIPOS)],
            'monto'       => ['required', 'numeric', 'min:0.01'],
            'metodo_pago' => ['nullable', 'string', 'in:' . implode(',', \App\Models\CashMovement::METODOS_PAGO)],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $movimiento = $this->cajaService->registrarMovimiento(
                cashRegisterId: $cashRegister->id,
                tipo: $request->tipo,
                subtipo: $request->subtipo,
                monto: (float) $request->monto,
                metodoPago: $request->metodo_pago ?? 'efectivo',
                userId: Auth::id(),
                descripcion: $request->descripcion
            );

            return response()->json([
                'message'    => 'Movimiento registrado exitosamente.',
                'movimiento' => $movimiento,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar el movimiento.',
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /admin/caja/registros/{cashRegister}/resumen - get summary (totals).
     */
    public function resumen(CashRegister $cashRegister): JsonResponse
    {
        $apertura = $this->cajaService->getAperturaActiva($cashRegister->id);

        if (!$apertura) {
            return response()->json([
                'message' => 'No hay una apertura activa para esta caja.',
            ], 404);
        }

        $resumen = $this->cajaService->getResumenApertura($apertura);

        return response()->json([
            'apertura' => $apertura->load('usuario'),
            'resumen'  => $resumen,
        ]);
    }

    /**
     * POST /admin/caja/pagos - record payment for an order.
     * Body: { pedido_id, monto_pagado, metodo_pago, cash_register_id?, detalles_pago?: [] }
     */
    public function registrarPago(Request $request): JsonResponse
    {
        $request->validate([
            'pedido_id'            => ['required', 'integer', 'exists:pedidos,id'],
            'monto_pagado'         => ['required', 'numeric', 'min:0.01'],
            'metodo_pago'          => ['required', 'string', 'in:' . implode(',', \App\Models\Payment::METODOS_PAGO)],
            'cash_register_id'     => ['nullable', 'integer', 'exists:cash_registers,id'],
            'detalles_pago'        => ['nullable', 'array'],
            'detalles_pago.*.metodo_pago' => ['required_with:detalles_pago', 'string', 'in:efectivo,tarjeta,transferencia'],
            'detalles_pago.*.monto'       => ['required_with:detalles_pago', 'numeric', 'min:0.01'],
        ]);

        try {
            $payment = $this->paymentService->registrarPago(
                pedidoId: (int) $request->pedido_id,
                montoPagado: (float) $request->monto_pagado,
                metodoPago: $request->metodo_pago,
                userId: Auth::id(),
                cashRegisterId: $request->cash_register_id ? (int) $request->cash_register_id : null,
                detallesPago: $request->detalles_pago ?? []
            );

            return response()->json([
                'message' => 'Pago registrado exitosamente.',
                'payment' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar el pago.',
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /admin/caja/pagos/pedido/{pedido} - get payments for a pedido.
     */
    public function getPagosByPedido(Pedido $pedido): JsonResponse
    {
        $pagos = $this->paymentService->getPaymentsByPedido($pedido->id);

        return response()->json([
            'pagos'  => $pagos,
            'pedido' => $pedido->only(['id', 'total', 'payment_status', 'estado']),
        ]);
    }
}
