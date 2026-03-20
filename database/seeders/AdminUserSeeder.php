<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Create or update the app owner account with admin access.
     * Run this seeder independently to fix missing role assignments:
     *   php artisan db:seed --class=AdminUserSeeder
     *
     * Configure via environment variables:
     *   ADMIN_EMAIL    (default: javis9203@gmail.com)
     *   ADMIN_PASSWORD (default: javis9203)
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $email    = env('ADMIN_EMAIL', 'javis9203@gmail.com');
        $password = env('ADMIN_PASSWORD', 'javis9203');

        $owner = User::firstOrCreate(
            ['email' => $email],
            [
                'name'              => 'Javier',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
                'activo'            => true,
            ]
        );

        $owner->syncRoles(['admin']);

        $this->command->info("Usuario {$owner->email} tiene rol admin.");
    }
}
