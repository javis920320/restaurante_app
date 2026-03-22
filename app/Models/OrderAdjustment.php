<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAdjustment extends Model
{
    protected $table = 'order_adjustments';

    const TIPOS = ['descuento', 'recargo'];

    protected $fillable = [
        'pedido_id',
        'tipo',
        'valor',
        'motivo',
        'usuario_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
    ];

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
