<?php

use App\Models\Categoria;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Plato;
use App\Models\User;

test('unauthenticated users cannot access sanctum protected api routes', function () {
    $this->getJson('/api/admin/dashboard/metrics')
        ->assertStatus(401);
});

test('unauthenticated users cannot access pedidos api route', function () {
    $this->getJson('/api/pedidos')
        ->assertStatus(401);
});

test('authenticated users can access dashboard metrics via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/dashboard/metrics')
        ->assertStatus(200);
});

test('authenticated users can access mesas status via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/mesas/status')
        ->assertStatus(200);
});

test('authenticated users can access cocina pedidos via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/cocina/pedidos')
        ->assertStatus(200);
});

test('authenticated users can access dashboard reportes via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/dashboard/reportes')
        ->assertStatus(200);
});

test('authenticated users can access pedidos kanban via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/dashboard/pedidos-kanban')
        ->assertStatus(200);
});

test('authenticated users can access pedidos list via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/pedidos')
        ->assertStatus(200);
});

test('unauthenticated users cannot access kanban por area api route', function () {
    $this->getJson('/api/admin/kanban/kitchen')
        ->assertStatus(401);
});

test('authenticated users can access kanban por area kitchen via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/admin/kanban/kitchen')
        ->assertStatus(200);

    $response->assertJsonStructure([
        'pendiente',
        'en_preparacion',
        'listo',
        'entregado',
    ]);
});

test('authenticated users can access kanban por area bar via sanctum', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/admin/kanban/bar')
        ->assertStatus(200);

    $response->assertJsonStructure([
        'pendiente',
        'en_preparacion',
        'listo',
        'entregado',
    ]);
});

test('kanban por area returns 422 for invalid area', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/kanban/invalid')
        ->assertStatus(422);
});

test('kanban por area returns correct columns with order item data', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $mesa = Mesa::create(['nombre' => 'Mesa Test', 'capacidad' => 4, 'estado' => 'ocupada', 'activa' => true]);
    $categoria = Categoria::create(['nombre' => 'Categoria Test']);
    $plato = Plato::create([
        'nombre' => 'Plato Test',
        'precio' => 10.00,
        'categoria_id' => $categoria->id,
        'production_area' => 'kitchen',
        'disponible' => true,
        'activo' => true,
    ]);
    $pedido = Pedido::create([
        'mesa_id' => $mesa->id,
        'estado' => 'en_preparacion',
        'payment_status' => 'pending',
        'subtotal' => 10.00,
        'total' => 10.00,
    ]);
    PedidoDetalle::create([
        'pedido_id' => $pedido->id,
        'producto_id' => $plato->id,
        'cantidad' => 1,
        'precio_unitario' => 10.00,
        'subtotal' => 10.00,
        'production_area' => 'kitchen',
        'estado' => 'pendiente',
    ]);

    $response = $this->withToken($token)
        ->getJson('/api/admin/kanban/kitchen')
        ->assertStatus(200);

    $response->assertJsonStructure([
        'pendiente' => [
            '*' => [
                'group_id',
                'pedido_id',
                'mesa' => ['id', 'nombre'],
                'created_at',
                'tiempo_transcurrido',
                'item_ids',
                'items' => [
                    '*' => ['id', 'nombre', 'cantidad', 'estado'],
                ],
            ],
        ],
        'en_preparacion',
        'listo',
        'entregado',
    ]);

    $response->assertJsonCount(1, 'pendiente');
});
