<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Mesa;
use App\Models\Plato;
use App\Models\Restaurante;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un usuario de prueba
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@restaurante.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Crear un restaurante
        $restaurante = Restaurante::create([
            'nombre' => 'Restaurante Demo',
            'direccion' => 'Calle Principal #123',
            'telefono' => '+57 300 1234567',
            'email' => 'contacto@restaurante.com',
            'activo' => true,
        ]);

        // Crear categorías
        $categorias = [
            ['nombre' => 'Entradas'],
            ['nombre' => 'Platos Fuertes'],
            ['nombre' => 'Postres'],
            ['nombre' => 'Bebidas'],
        ];

        foreach ($categorias as $cat) {
            Categoria::create($cat);
        }

        // Crear platos
        $platos = [
            [
                'nombre' => 'Ensalada César',
                'descripcion' => 'Fresca ensalada con aderezo césar',
                'precio' => 15000,
                'categoria_id' => 1,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
            [
                'nombre' => 'Sopa de Tomate',
                'descripcion' => 'Crema de tomate casera',
                'precio' => 12000,
                'categoria_id' => 1,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
            [
                'nombre' => 'Filete de Res',
                'descripcion' => 'Filete de res con papas y vegetales',
                'precio' => 45000,
                'categoria_id' => 2,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
            [
                'nombre' => 'Pasta Carbonara',
                'descripcion' => 'Pasta con salsa carbonara y bacon',
                'precio' => 28000,
                'categoria_id' => 2,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
            [
                'nombre' => 'Tiramisu',
                'descripcion' => 'Postre italiano tradicional',
                'precio' => 12000,
                'categoria_id' => 3,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
            [
                'nombre' => 'Jugo Natural',
                'descripcion' => 'Jugo de frutas naturales',
                'precio' => 8000,
                'categoria_id' => 4,
                'restaurante_id' => $restaurante->id,
                'activo' => true,
            ],
        ];

        foreach ($platos as $plato) {
            Plato::create($plato);
        }

        // Crear mesas (QR tokens se generan automáticamente)
        $mesas = [
            [
                'nombre' => 'Mesa 1',
                'capacidad' => 4,
                'estado' => 'disponible',
                'restaurante_id' => $restaurante->id,
                'activa' => true,
            ],
            [
                'nombre' => 'Mesa 2',
                'capacidad' => 2,
                'estado' => 'disponible',
                'restaurante_id' => $restaurante->id,
                'activa' => true,
            ],
            [
                'nombre' => 'Mesa 3',
                'capacidad' => 6,
                'estado' => 'disponible',
                'restaurante_id' => $restaurante->id,
                'activa' => true,
            ],
            [
                'nombre' => 'Mesa 4',
                'capacidad' => 4,
                'estado' => 'disponible',
                'restaurante_id' => $restaurante->id,
                'activa' => true,
            ],
        ];

        foreach ($mesas as $mesa) {
            Mesa::create($mesa);
        }

        $this->command->info('✅ Datos de prueba creados exitosamente');
        $this->command->info('📧 Email: admin@restaurante.com');
        $this->command->info('🔑 Password: password');
        $this->command->info('🏢 Restaurante: ' . $restaurante->nombre);
        $this->command->info('🪑 Mesas creadas: ' . Mesa::count());
        $this->command->info('🍽️ Platos creados: ' . Plato::count());
    }
}
