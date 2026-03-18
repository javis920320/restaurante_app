<?php

namespace Database\Seeders;

use App\Models\Restaurante;
use Illuminate\Database\Seeder;

class RestauranteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Restaurante::count() === 0) {
            Restaurante::create([
                'nombre' => 'Mi Restaurante',
                'direccion' => null,
                'telefono' => null,
                'email' => null,
                'activo' => true,
            ]);

            $this->command->info('✅ Restaurante por defecto creado.');
        }
    }
}
