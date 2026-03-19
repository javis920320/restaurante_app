<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Reset permissions cache
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    // Create required permissions and admin role
    Permission::firstOrCreate(['name' => 'gestionar usuarios']);
    Permission::firstOrCreate(['name' => 'gestionar roles']);

    $admin = Role::firstOrCreate(['name' => 'admin']);
    $admin->syncPermissions(['gestionar usuarios', 'gestionar roles']);
});

// ── Access Control ─────────────────────────────────────────────────────────

test('guests are redirected to login from usuarios', function () {
    $this->get('/usuarios')->assertRedirect('/login');
});

test('users without gestionar usuarios permission cannot access usuarios', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/usuarios')->assertForbidden();
});

test('users with gestionar usuarios permission can access usuarios', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)->get('/usuarios')->assertOk();
});

// ── Create User ────────────────────────────────────────────────────────────

test('admin can create a new user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $mesero = Role::firstOrCreate(['name' => 'mesero']);

    $this->actingAs($admin)->post('/usuarios', [
        'name'                  => 'Nuevo Mesero',
        'email'                 => 'mesero@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'activo'                => true,
        'roles'                 => ['mesero'],
    ])->assertRedirect('/usuarios');

    $this->assertDatabaseHas('users', ['email' => 'mesero@test.com', 'activo' => true]);

    $newUser = User::where('email', 'mesero@test.com')->first();
    expect($newUser->hasRole('mesero'))->toBeTrue();
});

// ── Update User ────────────────────────────────────────────────────────────

test('admin can update a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create(['name' => 'Original Name', 'activo' => true]);

    $this->actingAs($admin)->put("/usuarios/{$target->id}", [
        'name'   => 'Updated Name',
        'email'  => $target->email,
        'activo' => false,
        'roles'  => [],
    ])->assertRedirect('/usuarios');

    $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Updated Name', 'activo' => false]);
});

// ── Toggle Activo ─────────────────────────────────────────────────────────

test('admin can toggle user active status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create(['activo' => true]);

    $this->actingAs($admin)->post("/usuarios/{$target->id}/toggle-activo")
        ->assertRedirect();

    expect($target->fresh()->activo)->toBeFalse();
});

test('admin cannot deactivate themselves', function () {
    $admin = User::factory()->create(['activo' => true]);
    $admin->assignRole('admin');

    $this->actingAs($admin)->post("/usuarios/{$admin->id}/toggle-activo")
        ->assertRedirect();

    // Status should remain unchanged
    expect($admin->fresh()->activo)->toBeTrue();
});

// ── Delete User ───────────────────────────────────────────────────────────

test('admin can delete a user', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $target = User::factory()->create();

    $this->actingAs($admin)->delete("/usuarios/{$target->id}")
        ->assertRedirect('/usuarios');

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('admin cannot delete themselves', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->delete("/usuarios/{$admin->id}")
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
