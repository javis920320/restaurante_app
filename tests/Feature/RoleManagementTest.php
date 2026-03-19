<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'gestionar roles']);
    Permission::firstOrCreate(['name' => 'gestionar usuarios']);

    $admin = Role::firstOrCreate(['name' => 'admin']);
    $admin->syncPermissions(['gestionar roles', 'gestionar usuarios']);
});

// ── Access Control ─────────────────────────────────────────────────────────

test('guests are redirected to login from roles', function () {
    $this->get('/roles')->assertRedirect('/login');
});

test('users without gestionar roles permission cannot access roles', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/roles')->assertForbidden();
});

test('users with gestionar roles permission can access roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->get('/roles')->assertOk();
});

// ── Create Role ────────────────────────────────────────────────────────────

test('admin can create a new role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->post('/roles', [
        'name'        => 'supervisor',
        'permissions' => ['gestionar usuarios'],
    ])->assertRedirect('/roles');

    $role = Role::where('name', 'supervisor')->first();
    expect($role)->not->toBeNull();
    expect($role->hasPermissionTo('gestionar usuarios'))->toBeTrue();
});

// ── Update Role ────────────────────────────────────────────────────────────

test('admin can update a role and its permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $role = Role::create(['name' => 'temporal']);

    $this->actingAs($admin)->put("/roles/{$role->id}", [
        'name'        => 'temporal-updated',
        'permissions' => ['gestionar roles'],
    ])->assertRedirect('/roles');

    $role->refresh();
    expect($role->name)->toBe('temporal-updated');
    expect($role->hasPermissionTo('gestionar roles'))->toBeTrue();
});

// ── Delete Role ────────────────────────────────────────────────────────────

test('admin can delete an empty role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $role = Role::create(['name' => 'to-delete']);

    $this->actingAs($admin)->delete("/roles/{$role->id}")
        ->assertRedirect('/roles');

    expect(Role::where('name', 'to-delete')->exists())->toBeFalse();
});

test('admin cannot delete a role that has users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    // admin role has users (the admin user itself), so deleting admin should fail
    $adminRole = Role::where('name', 'admin')->first();

    $this->actingAs($admin)->delete("/roles/{$adminRole->id}")
        ->assertRedirect();

    expect(Role::where('name', 'admin')->exists())->toBeTrue();
});
