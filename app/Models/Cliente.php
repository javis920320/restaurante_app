<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $fillable = [
        'dni',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'direccion',
    ];
}
