<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoDetalle extends Model
{
    protected $fillable = [
        'pedido_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
        'notas',
        'production_area',
        'estado',
    ];

    const ESTADOS = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    protected $attributes = [
        'production_area' => 'none',
        'estado' => 'pendiente',
    ];

    /**
     * Relación con pedido
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    /**
     * Relación con producto/plato
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Plato::class, 'producto_id');
    }
}
