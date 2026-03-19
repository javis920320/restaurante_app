<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $allPermissions = [
            // Orders
            'crear pedido',
            'ver pedidos',
            'cambiar estado pedido',
            // Tables
            'asignar mesa',
            'cerrar mesa',
            // Billing
            'cobrar',
            // Reports
            'acceder reportes',
            // User management
            'gestionar usuarios',
            'gestionar roles',
        ];

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $admin   = Role::firstOrCreate(['name' => 'admin']);
        $mesero  = Role::firstOrCreate(['name' => 'mesero']);
        $cocina  = Role::firstOrCreate(['name' => 'cocina']);
        $caja    = Role::firstOrCreate(['name' => 'caja']);
        $cliente = Role::firstOrCreate(['name' => 'cliente']);

        // Legacy role for backward compatibility
        Role::firstOrCreate(['name' => 'cocinero']);

        // Admin gets all permissions
        $admin->syncPermissions($allPermissions);

        // Assign permissions per role
        $mesero->syncPermissions(['crear pedido', 'ver pedidos', 'cambiar estado pedido', 'asignar mesa']);
        $cocina->syncPermissions(['ver pedidos', 'cambiar estado pedido']);
        $caja->syncPermissions(['ver pedidos', 'cobrar', 'cerrar mesa', 'acceder reportes']);
        $cliente->syncPermissions(['ver pedidos']);
    }
}
