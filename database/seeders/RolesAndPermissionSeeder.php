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
        $admin=Role::firstOrCreate(['name'=>'admin']);  
        $cocinero=Role::firstOrCreate(['name'=>'cocinero']);
        $mesero=Role::firstOrCreate(['name'=>'mesero']);
        $cliente=Role::firstOrCreate(['name'=>'cliente']);

        $permissions = ['crear pedido', 'ver pedidos', 'cobrar', 'asignar mesa'];

       foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(['name' => $permission]);
            $admin->givePermissionTo($perm);
        }
        // Asignar permisos específicos a los otros roles
        $cocinero->givePermissionTo(['ver pedidos']);
        $mesero->givePermissionTo(['crear pedido', 'ver pedidos', 'cobrar']);
        $cliente->givePermissionTo(['ver pedidos']);
    }
}
