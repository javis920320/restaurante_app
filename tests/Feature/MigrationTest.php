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
