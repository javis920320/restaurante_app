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
