<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Mesa;


class MesaFactory extends Factory
{
    protected $model = Mesa::class;

    public function definition()
    {
        return [
            //'numero' => $this->faker->unique()->numberBetween(1, 100),
            'nombre' => $this->faker->unique()->word(), 
            'capacidad' => $this->faker->numberBetween(2, 12),
            //'ubicacion' => $this->faker->randomElement(['interior', 'exterior', 'terraza']),
            'estado' => $this->faker->randomElement(['disponible', 'ocupada', 'reservada']),
        ];
    }
}