<?php

use App\Models\CashRegister;
use App\Models\CashOpening;
use App\Models\CashClosing;
use App\Models\CashMovement;
use App\Models\Payment;
use App\Models\User;
use App\Services\CajaService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

// ────────────────────────────────
// Migration / schema tests
// ────────────────────────────────

test('cash_registers table exists with required columns', function () {
    expect(Schema::hasTable('cash_registers'))->toBeTrue();
    foreach (['id', 'nombre', 'estado', 'usuario_id', 'created_at', 'updated_at'] as $col) {
        expect(Schema::hasColumn('cash_registers', $col))->toBeTrue();
    }
});

test('cash_openings table exists with required columns', function () {
    expect(Schema::hasTable('cash_openings'))->toBeTrue();
    foreach (['id', 'cash_register_id', 'usuario_id', 'monto_inicial', 'fecha_apertura', 'estado'] as $col) {
        expect(Schema::hasColumn('cash_openings', $col))->toBeTrue();
    }
});

test('cash_closings table exists with required columns', function () {
    expect(Schema::hasTable('cash_closings'))->toBeTrue();
    foreach (['id', 'cash_opening_id', 'monto_teorico', 'monto_real', 'diferencia', 'fecha_cierre'] as $col) {
        expect(Schema::hasColumn('cash_closings', $col))->toBeTrue();
    }
});

test('cash_movements table exists with required columns', function () {
    expect(Schema::hasTable('cash_movements'))->toBeTrue();
    foreach (['id', 'cash_register_id', 'cash_opening_id', 'tipo', 'subtipo', 'monto', 'metodo_pago', 'fecha'] as $col) {
        expect(Schema::hasColumn('cash_movements', $col))->toBeTrue();
    }
});

test('payments table exists with required columns', function () {
    expect(Schema::hasTable('payments'))->toBeTrue();
    foreach (['id', 'pedido_id', 'cash_opening_id', 'monto_total', 'monto_pagado', 'cambio', 'estado', 'metodo_pago'] as $col) {
        expect(Schema::hasColumn('payments', $col))->toBeTrue();
    }
});

test('payment_details table exists with required columns', function () {
    expect(Schema::hasTable('payment_details'))->toBeTrue();
    foreach (['id', 'payment_id', 'metodo_pago', 'monto'] as $col) {
        expect(Schema::hasColumn('payment_details', $col))->toBeTrue();
    }
});

test('order_adjustments table exists with required columns', function () {
    expect(Schema::hasTable('order_adjustments'))->toBeTrue();
    foreach (['id', 'pedido_id', 'tipo', 'valor', 'motivo', 'usuario_id'] as $col) {
        expect(Schema::hasColumn('order_adjustments', $col))->toBeTrue();
    }
});

// ────────────────────────────────
// CajaService unit tests
// ────────────────────────────────

test('CajaService can open a cash register', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja Principal', 'estado' => 'cerrada']);
    $service  = app(CajaService::class);

    $apertura = $service->abrirCaja($registro->id, $user->id, 100.00);

    expect($apertura)->toBeInstanceOf(CashOpening::class);
    expect($apertura->estado)->toBe('abierta');
    expect((float) $apertura->monto_inicial)->toBe(100.0);
    expect($registro->fresh()->estado)->toBe('abierta');
});

test('CajaService throws exception when opening an already-open register', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja 2', 'estado' => 'cerrada']);
    $service  = app(CajaService::class);

    $service->abrirCaja($registro->id, $user->id, 50.00);

    expect(fn () => $service->abrirCaja($registro->id, $user->id, 50.00))
        ->toThrow(Exception::class, 'La caja ya está abierta.');
});

test('CajaService can close a cash register', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja 3', 'estado' => 'cerrada']);
    $service  = app(CajaService::class);

    $service->abrirCaja($registro->id, $user->id, 200.00);
    $cierre = $service->cerrarCaja($registro->id, $user->id, 200.00);

    expect($cierre)->toBeInstanceOf(CashClosing::class);
    expect((float) $cierre->monto_real)->toBe(200.0);
    expect($registro->fresh()->estado)->toBe('cerrada');
});

test('CajaService can record a manual movement', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja 4', 'estado' => 'cerrada']);
    $service  = app(CajaService::class);

    $service->abrirCaja($registro->id, $user->id, 100.00);

    $movimiento = $service->registrarMovimiento(
        cashRegisterId: $registro->id,
        tipo: 'egreso',
        subtipo: 'gasto_operativo',
        monto: 25.00,
        metodoPago: 'efectivo',
        userId: $user->id,
        descripcion: 'Compra de insumos'
    );

    expect($movimiento)->toBeInstanceOf(CashMovement::class);
    expect($movimiento->tipo)->toBe('egreso');
    expect($movimiento->subtipo)->toBe('gasto_operativo');
    expect((float) $movimiento->monto)->toBe(25.0);
});

test('CajaService resumen calculates saldo correctly', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja 5', 'estado' => 'cerrada']);
    $service  = app(CajaService::class);

    $apertura = $service->abrirCaja($registro->id, $user->id, 100.00);
    $service->registrarMovimiento($registro->id, 'egreso', 'gasto_operativo', 30.00, 'efectivo', $user->id);

    $resumen = $service->getResumenApertura($apertura->fresh());

    expect($resumen['monto_inicial'])->toBe(100.0);
    expect($resumen['total_egresos'])->toBe(30.0);
    expect($resumen['saldo_actual'])->toBe(70.0);
});

// ────────────────────────────────
// PaymentService unit tests
// ────────────────────────────────

test('PaymentService registers a payment and creates cash movements', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja Pago', 'estado' => 'cerrada']);

    /** @var CajaService $cajaService */
    $cajaService = app(CajaService::class);
    $cajaService->abrirCaja($registro->id, $user->id, 0.00);

    // Create a minimal order
    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Test', 'activo' => true]);
    $mesa = \App\Models\Mesa::create(['nombre' => 'Mesa 1', 'restaurante_id' => $restaurante->id, 'activa' => true, 'capacidad' => 4, 'estado' => 'disponible']);
    $pedido = \App\Models\Pedido::create([
        'mesa_id'  => $mesa->id,
        'estado'   => 'pendiente',
        'subtotal' => 50.00,
        'total'    => 50.00,
    ]);

    /** @var PaymentService $paymentService */
    $paymentService = app(PaymentService::class);
    $payment = $paymentService->registrarPago(
        pedidoId: $pedido->id,
        montoPagado: 100.00,
        metodoPago: 'efectivo',
        userId: $user->id,
        cashRegisterId: $registro->id
    );

    expect($payment)->toBeInstanceOf(Payment::class);
    expect($payment->estado)->toBe('pagado');
    expect((float) $payment->cambio)->toBe(50.0);

    // pedido should now be marked paid
    expect($pedido->fresh()->payment_status)->toBe('paid');

    // Two cash movements: ingreso/venta + egreso/cambio_entregado
    $movimientos = CashMovement::where('referencia_id', $pedido->id)->get();
    expect($movimientos)->toHaveCount(2);

    $ingreso = $movimientos->where('tipo', 'ingreso')->first();
    expect($ingreso)->not->toBeNull();
    expect((float) $ingreso->monto)->toBe(50.0);

    $egreso = $movimientos->where('tipo', 'egreso')->first();
    expect($egreso)->not->toBeNull();
    expect((float) $egreso->monto)->toBe(50.0);
});

test('PaymentService throws exception when paying an already-paid order', function () {
    $user = User::factory()->create();

    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Test2', 'activo' => true]);
    $mesa = \App\Models\Mesa::create(['nombre' => 'Mesa 2', 'restaurante_id' => $restaurante->id, 'activa' => true, 'capacidad' => 4, 'estado' => 'disponible']);
    $pedido = \App\Models\Pedido::create([
        'mesa_id'        => $mesa->id,
        'estado'         => 'pendiente',
        'subtotal'       => 30.00,
        'total'          => 30.00,
        'payment_status' => 'paid',
    ]);

    $paymentService = app(PaymentService::class);

    expect(fn () => $paymentService->registrarPago(
        pedidoId: $pedido->id,
        montoPagado: 30.00,
        metodoPago: 'efectivo',
        userId: $user->id
    ))->toThrow(Exception::class, 'El pedido ya está marcado como pagado.');
});

// ────────────────────────────────
// API endpoint tests
// ────────────────────────────────

test('authenticated users can list cash registers', function () {
    $user = User::factory()->create();
    CashRegister::create(['nombre' => 'Caja API', 'estado' => 'cerrada']);

    $this->actingAs($user)
        ->getJson('/api/admin/caja/registros')
        ->assertOk()
        ->assertJsonStructure(['registros']);
});

test('authenticated users can create a cash register', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/admin/caja/registros', ['nombre' => 'Caja Nueva'])
        ->assertCreated()
        ->assertJsonPath('registro.nombre', 'Caja Nueva');
});

test('authenticated users can open and close a cash register via API', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja API 2', 'estado' => 'cerrada']);

    // Open
    $this->actingAs($user)
        ->postJson("/api/admin/caja/registros/{$registro->id}/abrir", ['monto_inicial' => 150.00])
        ->assertCreated()
        ->assertJsonPath('apertura.estado', 'abierta');

    expect($registro->fresh()->estado)->toBe('abierta');

    // Close
    $this->actingAs($user)
        ->postJson("/api/admin/caja/registros/{$registro->id}/cerrar", ['monto_real' => 150.00])
        ->assertOk()
        ->assertJsonPath('cierre.monto_real', '150.00');

    expect($registro->fresh()->estado)->toBe('cerrada');
});

test('authenticated users can register a payment via API', function () {
    $user     = User::factory()->create();
    $registro = CashRegister::create(['nombre' => 'Caja Pago API', 'estado' => 'cerrada']);

    $cajaService = app(CajaService::class);
    $cajaService->abrirCaja($registro->id, $user->id, 0.00);

    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Test3', 'activo' => true]);
    $mesa = \App\Models\Mesa::create(['nombre' => 'Mesa 3', 'restaurante_id' => $restaurante->id, 'activa' => true, 'capacidad' => 4, 'estado' => 'disponible']);
    $pedido = \App\Models\Pedido::create([
        'mesa_id'  => $mesa->id,
        'estado'   => 'listo',
        'subtotal' => 40.00,
        'total'    => 40.00,
    ]);

    $this->actingAs($user)
        ->postJson('/api/admin/caja/pagos', [
            'pedido_id'        => $pedido->id,
            'monto_pagado'     => 50.00,
            'metodo_pago'      => 'efectivo',
            'cash_register_id' => $registro->id,
        ])
        ->assertCreated()
        ->assertJsonPath('payment.estado', 'pagado');

    expect($pedido->fresh()->payment_status)->toBe('paid');
});

test('guests cannot access cash register API endpoints', function () {
    $this->getJson('/api/admin/caja/registros')->assertUnauthorized();
    $this->postJson('/api/admin/caja/registros', ['nombre' => 'Test'])->assertUnauthorized();
    $this->postJson('/api/admin/caja/pagos', [])->assertUnauthorized();
});
