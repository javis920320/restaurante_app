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
