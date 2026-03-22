<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(RolesAndPermissionSeeder::class);
        $this->call(RestauranteSeeder::class);

        // Assign admin role to test user
        $user->assignRole('admin');

        // Create or update the app owner account with admin access
        $this->call(AdminUserSeeder::class);
        $this->call(MesaSeeder::class);
    }
}
