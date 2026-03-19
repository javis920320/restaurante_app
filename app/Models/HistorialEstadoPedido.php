<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialEstadoPedido extends Model
{
    public $timestamps = false;

    protected $table = 'historial_estados_pedido';

    protected $fillable = [
        'pedido_id',
        'estado_anterior',
        'estado_nuevo',
        'user_id',
        'canal',
        'notas',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Relación con el pedido
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    /**
     * Relación con el usuario que realizó el cambio
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
