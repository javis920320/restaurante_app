<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    
    use HasFactory;
    protected $fillable = [
        'nombre',
    ];
    //relaciones con los modelos
    public function platos()
    {
        return $this->hasMany(Plato::class);
    }
}
