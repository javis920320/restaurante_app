<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemPedido extends Model
{
    protected $table = 'pedido_item'; // Nombre de la tabla en la base de datos

    protected $fillable = [
        'pedido_id',
        'plato_id',
        'cantidad',
        'precio',
        'total',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

  
}
