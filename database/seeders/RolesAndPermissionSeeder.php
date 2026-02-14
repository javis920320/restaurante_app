<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
        // Create roles as specified in requirements
        $admin = Role::firstOrCreate(['name' => 'admin']);  
        $cocina = Role::firstOrCreate(['name' => 'cocina']);
        $mesero = Role::firstOrCreate(['name' => 'mesero']);
        $caja = Role::firstOrCreate(['name' => 'caja']);
        $cliente = Role::firstOrCreate(['name' => 'cliente']);
        
        // Legacy role for backward compatibility
        $cocinero = Role::firstOrCreate(['name' => 'cocinero']);

        $permissions = ['crear pedido', 'ver pedidos', 'cobrar', 'asignar mesa', 'cambiar estado pedido', 'cerrar mesa'];

       foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(['name' => $permission]);
            $admin->givePermissionTo($perm);
        }
        
        // Assign specific permissions to roles
        $cocina->givePermissionTo(['ver pedidos', 'cambiar estado pedido']);
        $cocinero->givePermissionTo(['ver pedidos', 'cambiar estado pedido']); // Legacy role
        $mesero->givePermissionTo(['crear pedido', 'ver pedidos', 'cambiar estado pedido']);
        $caja->givePermissionTo(['ver pedidos', 'cobrar', 'cerrar mesa']);
        $cliente->givePermissionTo(['ver pedidos']);
    }
}
