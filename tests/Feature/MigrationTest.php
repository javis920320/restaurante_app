<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('platos table has deleted_at column for soft deletes', function () {
    expect(Schema::hasColumn('platos', 'deleted_at'))->toBeTrue();
});

test('pedidos table has deleted_at column for soft deletes', function () {
    expect(Schema::hasColumn('pedidos', 'deleted_at'))->toBeTrue();
});

test('mesas table has deleted_at column for soft deletes', function () {
    expect(Schema::hasColumn('mesas', 'deleted_at'))->toBeTrue();
});

test('restaurantes table has deleted_at column for soft deletes', function () {
    expect(Schema::hasColumn('restaurantes', 'deleted_at'))->toBeTrue();
});

test('plato model can use soft deletes', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test']);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Test Plato',
        'precio' => 10.00,
        'categoria_id' => $categoria->id,
        'activo' => true
    ]);
    
    expect(\App\Models\Plato::count())->toBe(1);
    
    $plato->delete();
    expect(\App\Models\Plato::count())->toBe(0);
    expect(\App\Models\Plato::withTrashed()->count())->toBe(1);
});

test('platos table has disponible column', function () {
    expect(Schema::hasColumn('platos', 'disponible'))->toBeTrue();
});

test('platos table has orden column', function () {
    expect(Schema::hasColumn('platos', 'orden'))->toBeTrue();
});

test('categorias table has activo column', function () {
    expect(Schema::hasColumn('categorias', 'activo'))->toBeTrue();
});

test('categorias table has orden column', function () {
    expect(Schema::hasColumn('categorias', 'orden'))->toBeTrue();
});

test('opciones table exists with required columns', function () {
    expect(Schema::hasTable('opciones'))->toBeTrue();
    expect(Schema::hasColumn('opciones', 'plato_id'))->toBeTrue();
    expect(Schema::hasColumn('opciones', 'nombre'))->toBeTrue();
    expect(Schema::hasColumn('opciones', 'precio_extra'))->toBeTrue();
});

test('plato scope disponibles filters correctly', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test Scope']);
    \App\Models\Plato::create(['nombre' => 'Disponible', 'precio' => 10.00, 'categoria_id' => $categoria->id, 'disponible' => true, 'activo' => true]);
    \App\Models\Plato::create(['nombre' => 'Agotado', 'precio' => 8.00, 'categoria_id' => $categoria->id, 'disponible' => false, 'activo' => true]);

    expect(\App\Models\Plato::disponibles()->count())->toBe(1);
    expect(\App\Models\Plato::disponibles()->first()->nombre)->toBe('Disponible');
});

test('categoria cannot be deleted when it has active products (RN-02)', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Con Productos']);
    \App\Models\Plato::create(['nombre' => 'Plato Activo', 'precio' => 5.00, 'categoria_id' => $categoria->id, 'activo' => true]);

    expect($categoria->tieneProductosActivos())->toBeTrue();
});

test('categoria can be deleted when it has no active products', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Sin Activos']);
    \App\Models\Plato::create(['nombre' => 'Plato Inactivo', 'precio' => 5.00, 'categoria_id' => $categoria->id, 'activo' => false]);

    expect($categoria->tieneProductosActivos())->toBeFalse();
});

test('opcion belongs to plato', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test Opciones']);
    $plato = \App\Models\Plato::create(['nombre' => 'Hamburguesa', 'precio' => 15.00, 'categoria_id' => $categoria->id, 'activo' => true]);
    $opcion = \App\Models\Opcion::create(['plato_id' => $plato->id, 'nombre' => 'Con queso', 'precio_extra' => 2000]);

    expect($opcion->plato->id)->toBe($plato->id);
    expect($plato->opciones()->count())->toBe(1);
    expect($plato->opciones()->first()->nombre)->toBe('Con queso');
});

test('pedido model can use soft deletes', function () {
    $user = \App\Models\User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password')
    ]);
    
    $cliente = new \App\Models\Cliente();
    $cliente->nombre = 'Test';
    $cliente->apellido = 'Cliente';
    $cliente->dni = '12345678';
    $cliente->telefono = '1234567890';
    $cliente->email = 'cliente@example.com';
    $cliente->direccion = 'Test Address';
    $cliente->save();
    
    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Test Mesa',
        'capacidad' => 4,
        'estado' => 'disponible',
        'activa' => true
    ]);
    
    $pedido = \App\Models\Pedido::create([
        'cliente_id' => $cliente->id,
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'pendiente',
        'subtotal' => 10.00,
        'total' => 10.00
    ]);
    
    expect(\App\Models\Pedido::count())->toBe(1);
    
    $pedido->delete();
    expect(\App\Models\Pedido::count())->toBe(0);
    expect(\App\Models\Pedido::withTrashed()->count())->toBe(1);
});

test('platos table has production_area column', function () {
    expect(Schema::hasColumn('platos', 'production_area'))->toBeTrue();
});

test('pedido_detalles table has production_area column', function () {
    expect(Schema::hasColumn('pedido_detalles', 'production_area'))->toBeTrue();
});

test('pedido_detalles table has estado column', function () {
    expect(Schema::hasColumn('pedido_detalles', 'estado'))->toBeTrue();
});

test('plato production_area defaults to none', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test PA']);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Plato Sin Área',
        'precio' => 10.00,
        'categoria_id' => $categoria->id,
        'activo' => true,
    ]);

    expect($plato->production_area)->toBe('none');
});

test('plato can be assigned to kitchen production area', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test Kitchen']);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Hamburguesa',
        'precio' => 15.00,
        'categoria_id' => $categoria->id,
        'activo' => true,
        'production_area' => 'kitchen',
    ]);

    expect($plato->production_area)->toBe('kitchen');
});

test('plato can be assigned to bar production area', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Test Bar']);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Mojito',
        'precio' => 8.00,
        'categoria_id' => $categoria->id,
        'activo' => true,
        'production_area' => 'bar',
    ]);

    expect($plato->production_area)->toBe('bar');
});

test('pedido_detalle production_area is copied from product when order is created', function () {
    $categoria = \App\Models\Categoria::create(['nombre' => 'Bebidas']);
    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Test Restaurante', 'activo' => true]);
    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa 1',
        'capacidad' => 4,
        'estado' => 'disponible',
        'activa' => true,
        'restaurante_id' => $restaurante->id,
    ]);

    $platoBar = \App\Models\Plato::create([
        'nombre' => 'Cerveza',
        'precio' => 5.00,
        'categoria_id' => $categoria->id,
        'restaurante_id' => $restaurante->id,
        'activo' => true,
        'disponible' => true,
        'production_area' => 'bar',
    ]);

    $platoKitchen = \App\Models\Plato::create([
        'nombre' => 'Hamburguesa',
        'precio' => 12.00,
        'categoria_id' => $categoria->id,
        'restaurante_id' => $restaurante->id,
        'activo' => true,
        'disponible' => true,
        'production_area' => 'kitchen',
    ]);

    $user = \App\Models\User::create([
        'name' => 'Mesero',
        'email' => 'mesero2@test.com',
        'password' => bcrypt('password'),
    ]);

    $pedidoService = app(\App\Services\PedidoService::class);
    $pedido = $pedidoService->crearPedidoMesero(
        mesaId: $mesa->id,
        items: [
            ['producto_id' => $platoBar->id, 'cantidad' => 2, 'notas' => null],
            ['producto_id' => $platoKitchen->id, 'cantidad' => 1, 'notas' => null],
        ],
        userId: $user->id,
    );

    $detalles = $pedido->detalles()->with('producto')->get();
    $detalleBar = $detalles->where('producto_id', $platoBar->id)->first();
    $detalleKitchen = $detalles->where('producto_id', $platoKitchen->id)->first();

    expect($detalleBar->production_area)->toBe('bar');
    expect($detalleKitchen->production_area)->toBe('kitchen');
    expect($detalleBar->estado)->toBe('pendiente');
    expect($detalleKitchen->estado)->toBe('pendiente');
});

// ─── Dual State System ────────────────────────────────────────────────────────

test('pedidos table has payment_status column', function () {
    expect(Schema::hasColumn('pedidos', 'payment_status'))->toBeTrue();
});

test('new pedido defaults to payment_status pending', function () {
    $user = \App\Models\User::create([
        'name' => 'Test User',
        'email' => 'payment_test@example.com',
        'password' => bcrypt('password'),
    ]);

    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Payment Mesa',
        'capacidad' => 4,
        'estado' => 'disponible',
        'activa' => true,
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'pendiente',
        'subtotal' => 10.00,
        'total' => 10.00,
    ]);

    expect($pedido->payment_status)->toBe('pending');
    expect($pedido->estaPagado())->toBeFalse();
});

test('pedido can be marked as paid via markAsPaid service method', function () {
    $user = \App\Models\User::create([
        'name' => 'Cajero',
        'email' => 'cajero@example.com',
        'password' => bcrypt('password'),
    ]);

    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Pago',
        'capacidad' => 2,
        'estado' => 'disponible',
        'activa' => true,
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'entregado',
        'subtotal' => 25.00,
        'total' => 25.00,
    ]);

    expect($pedido->payment_status)->toBe('pending');

    $pedidoService = app(\App\Services\PedidoService::class);
    $pedidoPagado = $pedidoService->markAsPaid($pedido, $user->id);

    expect($pedidoPagado->payment_status)->toBe('paid');
    expect($pedidoPagado->estaPagado())->toBeTrue();
    expect($pedidoPagado->estado)->toBe('entregado'); // operational state unchanged
});

test('cambiarEstado no longer allows estado pagado', function () {
    $user = \App\Models\User::create([
        'name' => 'Test User Estado',
        'email' => 'estado_test@example.com',
        'password' => bcrypt('password'),
    ]);

    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Estado',
        'capacidad' => 2,
        'estado' => 'disponible',
        'activa' => true,
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'entregado',
        'subtotal' => 10.00,
        'total' => 10.00,
    ]);

    $pedidoService = app(\App\Services\PedidoService::class);

    expect(fn() => $pedidoService->cambiarEstado($pedido, 'pagado', $user->id))
        ->toThrow(\Exception::class);
});

test('cerrarMesa sets payment_status to paid and does not set estado to pagado', function () {
    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Test R', 'activo' => true]);
    $user = \App\Models\User::create([
        'name' => 'Test Cerrar',
        'email' => 'cerrar@example.com',
        'password' => bcrypt('password'),
    ]);

    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Cerrar',
        'capacidad' => 2,
        'estado' => 'ocupada',
        'activa' => true,
        'restaurante_id' => $restaurante->id,
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'entregado',
        'subtotal' => 15.00,
        'total' => 15.00,
    ]);

    $pedidoService = app(\App\Services\PedidoService::class);
    $pedidoCerrado = $pedidoService->cerrarMesa($pedido, $user->id);

    expect($pedidoCerrado->payment_status)->toBe('paid');
    expect($pedidoCerrado->estado)->not->toBe('pagado');
    expect($mesa->fresh()->estado)->toBe('disponible');
});

test('cambiarEstadoDetalle blocks en_preparacion when not paid and require_payment_before_preparation is true', function () {
    config(['restaurant.require_payment_before_preparation' => true]);

    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Gastrobar', 'activo' => true]);
    $categoria = \App\Models\Categoria::create(['nombre' => 'Bebidas KDS']);
    $user = \App\Models\User::create([
        'name' => 'Bartender',
        'email' => 'bartender@example.com',
        'password' => bcrypt('password'),
    ]);
    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Bar',
        'capacidad' => 2,
        'estado' => 'ocupada',
        'activa' => true,
        'restaurante_id' => $restaurante->id,
    ]);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Cerveza Block',
        'precio' => 5.00,
        'categoria_id' => $categoria->id,
        'restaurante_id' => $restaurante->id,
        'activo' => true,
        'disponible' => true,
        'production_area' => 'bar',
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'pendiente',
        'payment_status' => 'pending', // NOT paid
        'subtotal' => 5.00,
        'total' => 5.00,
    ]);

    $detalle = \App\Models\PedidoDetalle::create([
        'pedido_id' => $pedido->id,
        'producto_id' => $plato->id,
        'cantidad' => 1,
        'precio_unitario' => 5.00,
        'subtotal' => 5.00,
        'production_area' => 'bar',
        'estado' => 'pendiente',
    ]);

    $pedidoService = app(\App\Services\PedidoService::class);

    expect(fn() => $pedidoService->cambiarEstadoDetalle($detalle, 'en_preparacion'))
        ->toThrow(\Exception::class, 'El pedido debe estar pagado antes de iniciar la preparación.');
});

test('cambiarEstadoDetalle allows en_preparacion when paid and require_payment_before_preparation is true', function () {
    config(['restaurant.require_payment_before_preparation' => true]);

    $restaurante = \App\Models\Restaurante::create(['nombre' => 'Gastrobar2', 'activo' => true]);
    $categoria = \App\Models\Categoria::create(['nombre' => 'Bebidas Paid']);
    $user = \App\Models\User::create([
        'name' => 'Bartender2',
        'email' => 'bartender2@example.com',
        'password' => bcrypt('password'),
    ]);
    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Bar Paid',
        'capacidad' => 2,
        'estado' => 'ocupada',
        'activa' => true,
        'restaurante_id' => $restaurante->id,
    ]);
    $plato = \App\Models\Plato::create([
        'nombre' => 'Cerveza Allow',
        'precio' => 5.00,
        'categoria_id' => $categoria->id,
        'restaurante_id' => $restaurante->id,
        'activo' => true,
        'disponible' => true,
        'production_area' => 'bar',
    ]);

    $pedido = \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'pendiente',
        'payment_status' => 'paid', // IS paid
        'subtotal' => 5.00,
        'total' => 5.00,
    ]);

    $detalle = \App\Models\PedidoDetalle::create([
        'pedido_id' => $pedido->id,
        'producto_id' => $plato->id,
        'cantidad' => 1,
        'precio_unitario' => 5.00,
        'subtotal' => 5.00,
        'production_area' => 'bar',
        'estado' => 'pendiente',
    ]);

    $pedidoService = app(\App\Services\PedidoService::class);
    $detalleActualizado = $pedidoService->cambiarEstadoDetalle($detalle, 'en_preparacion');

    expect($detalleActualizado->estado)->toBe('en_preparacion');
});

test('dashboard metrics ventas_dia counts by payment_status not estado', function () {
    $user = \App\Models\User::create([
        'name' => 'Ventas User',
        'email' => 'ventas@example.com',
        'password' => bcrypt('password'),
    ]);
    $mesa = \App\Models\Mesa::create([
        'nombre' => 'Mesa Ventas',
        'capacidad' => 2,
        'estado' => 'disponible',
        'activa' => true,
    ]);

    // Paid order (payment_status=paid, estado=entregado)
    \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'entregado',
        'payment_status' => 'paid',
        'subtotal' => 50.00,
        'total' => 50.00,
        'created_at' => today(),
    ]);

    // Unpaid order (payment_status=pending, estado=entregado)
    \App\Models\Pedido::create([
        'user_id' => $user->id,
        'mesa_id' => $mesa->id,
        'estado' => 'entregado',
        'payment_status' => 'pending',
        'subtotal' => 30.00,
        'total' => 30.00,
        'created_at' => today(),
    ]);

    $service = app(\App\Services\DashboardService::class);
    // Clear any cached metrics
    \Illuminate\Support\Facades\Cache::forget('dashboard.metrics');
    $metrics = $service->getMetrics();

    expect($metrics['ventas_dia'])->toBe(50.0);
    expect($metrics['ticket_promedio'])->toBe(50.0);
});
