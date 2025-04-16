<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plato extends Model
{
    protected $fillable = [
        'nombre',
        'precio',
        'categoria_id',
        'imagen',
        'estado',
    ];  
    //relaciones con los modelos
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
    public function pedido()
    {
        return $this->belongsToMany(Pedido::class)->withPivot('cantidad','precio','total');
    }   
}
