<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $fillable = ['user_id', 'cliente_id', 'mesa_id', 'estado'];
    
    //relaciones con los modelos
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }   
    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }
    public function item()
    {
        return $this->hasMany(ItemPedido::class, 'pedido_id');
    }   
}
