<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'user_id',
        'mesa_id',
        'estado',
        'subtotal',
        'total',
        'notas',
        'canal',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Relación con cliente
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * Relación con usuario (mesero/cajero)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con mesa
     */
    public function mesa(): BelongsTo
    {
        return $this->belongsTo(Mesa::class);
    }

    /**
     * Relación con detalles del pedido
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(PedidoDetalle::class);
    }

    /**
     * Relación con el historial de estados
     */
    public function historial(): HasMany
    {
        return $this->hasMany(HistorialEstadoPedido::class)->orderBy('created_at', 'asc');
    }

    /**
     * Scope para pedidos por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para pedidos pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    /**
     * Scope para pedidos activos (no pagados ni cancelados)
     */
    public function scopeActivos($query)
    {
        return $query->whereNotIn('estado', ['pagado', 'cancelado']);
    }
}
