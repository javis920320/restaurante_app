<?php

namespace Database\Seeders;

use App\Models\Mesa;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MesaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Mesa::count() === 0) {



            $mesas = [
                [
                    'nombre' => "Mesa 1","estado" => "disponible",
                    'capacidad' => 4,
                    'restaurante_id' => 1
                ],
                [
                    'nombre' => "Mesa 2","estado" => "disponible",
                    'capacidad' => 4,
                    'restaurante_id' => 1
                ],
                [
                    'nombre' => "Mesa 3","estado" => "disponible",
                    'capacidad' => 2,
                    'restaurante_id' => 1
                ],
                [
                    'nombre' => "Mesa 4","estado" => "disponible",
                    'capacidad' => 6,
                    'restaurante_id' => 1
                ],
                [
                    'nombre' => "Mesa 5","estado" => "disponible",
                    'capacidad' => 4
                    ,'restaurante_id' => 1
                ],
            ];
            foreach ($mesas as $mesa) {
                Mesa::create($mesa);
            }

            $this->command->info('✅ Mesas por defecto creadas.');
        }
    }
}
