<?php

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
