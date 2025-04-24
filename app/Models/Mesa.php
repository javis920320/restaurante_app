<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    protected $fillable = [
        'nombre',
        'estado',
    ];
    //relaciones con los modelos
    public function pedido()
    {
        return $this->hasMany(Pedido::class);
    }   
}
