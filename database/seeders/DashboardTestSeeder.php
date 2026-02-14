<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DashboardTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test restaurant
        $restaurante = \App\Models\Restaurante::firstOrCreate([
            'nombre' => 'Restaurante Test',
        ], [
            'direccion' => 'Calle Test 123',
            'telefono' => '555-1234',
            'email' => 'test@restaurante.com',
            'activo' => true,
        ]);

        // Create test user with admin role
        $admin = \App\Models\User::firstOrCreate([
            'email' => 'admin@test.com',
        ], [
            'name' => 'Admin Test',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        // Create test client
        $cliente = \App\Models\Cliente::firstOrCreate([
            'dni' => '12345678',
        ], [
            'nombre' => 'Cliente Test',
            'apellido' => 'Apellido Test',
            'email' => 'cliente@test.com',
            'telefono' => '555-9999',
            'direccion' => 'Calle Test 456',
        ]);

        // Create categories
        $categoria1 = \App\Models\Categoria::firstOrCreate(['nombre' => 'Comidas']);
        $categoria2 = \App\Models\Categoria::firstOrCreate(['nombre' => 'Bebidas']);

        // Create products
        $productos = [
            ['nombre' => 'Hamburguesa', 'precio' => 15.50, 'categoria_id' => $categoria1->id],
            ['nombre' => 'Pizza', 'precio' => 20.00, 'categoria_id' => $categoria1->id],
            ['nombre' => 'Pasta', 'precio' => 18.00, 'categoria_id' => $categoria1->id],
            ['nombre' => 'Ensalada', 'precio' => 12.00, 'categoria_id' => $categoria1->id],
            ['nombre' => 'Coca Cola', 'precio' => 3.50, 'categoria_id' => $categoria2->id],
            ['nombre' => 'Agua', 'precio' => 2.00, 'categoria_id' => $categoria2->id],
        ];

        foreach ($productos as $prod) {
            \App\Models\Plato::firstOrCreate(
                ['nombre' => $prod['nombre'], 'restaurante_id' => $restaurante->id],
                [
                    'descripcion' => 'Descripción de ' . $prod['nombre'],
                    'precio' => $prod['precio'],
                    'categoria_id' => $prod['categoria_id'],
                    'activo' => true,
                ]
            );
        }

        // Create tables
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\Mesa::firstOrCreate(
                ['nombre' => "Mesa $i", 'restaurante_id' => $restaurante->id],
                [
                    'capacidad' => rand(2, 6),
                    'estado' => $i <= 5 ? 'ocupada' : 'disponible',
                    'activa' => true,
                ]
            );
        }

        // Create sample orders
        $mesas = \App\Models\Mesa::where('estado', 'ocupada')->get();
        $productos = \App\Models\Plato::all();
        
        $estados = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'];
        
        foreach ($mesas as $mesa) {
            // Create 1-2 orders per table
            $numPedidos = rand(1, 2);
            
            for ($j = 0; $j < $numPedidos; $j++) {
                $pedido = \App\Models\Pedido::create([
                    'mesa_id' => $mesa->id,
                    'cliente_id' => $cliente->id,
                    'user_id' => $admin->id,
                    'estado' => $estados[array_rand($estados)],
                    'subtotal' => 0,
                    'total' => 0,
                    'created_at' => now()->subMinutes(rand(5, 120)),
                ]);

                // Add 2-4 items to each order
                $total = 0;
                for ($k = 0; $k < rand(2, 4); $k++) {
                    $producto = $productos->random();
                    $cantidad = rand(1, 3);
                    $subtotal = $producto->precio * $cantidad;
                    
                    \App\Models\PedidoDetalle::create([
                        'pedido_id' => $pedido->id,
                        'producto_id' => $producto->id,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $producto->precio,
                        'subtotal' => $subtotal,
                    ]);
                    
                    $total += $subtotal;
                }

                $pedido->update([
                    'subtotal' => $total,
                    'total' => $total,
                ]);
            }
        }

        // Create some paid orders for today's sales
        $mesasLibres = \App\Models\Mesa::where('estado', 'disponible')->take(3)->get();
        foreach ($mesasLibres as $mesa) {
            $pedido = \App\Models\Pedido::create([
                'mesa_id' => $mesa->id,
                'cliente_id' => $cliente->id,
                'user_id' => $admin->id,
                'estado' => 'pagado',
                'subtotal' => 0,
                'total' => 0,
                'created_at' => now()->subHours(rand(1, 8)),
            ]);

            $total = 0;
            for ($k = 0; $k < rand(2, 5); $k++) {
                $producto = $productos->random();
                $cantidad = rand(1, 3);
                $subtotal = $producto->precio * $cantidad;
                
                \App\Models\PedidoDetalle::create([
                    'pedido_id' => $pedido->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $producto->precio,
                    'subtotal' => $subtotal,
                ]);
                
                $total += $subtotal;
            }

            $pedido->update([
                'subtotal' => $total,
                'total' => $total,
            ]);
        }

        $this->command->info('Dashboard test data created successfully!');
    }
}
