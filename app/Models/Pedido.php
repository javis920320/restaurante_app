<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    use SoftDeletes;

    /**
     * Valid operational states (production/kitchen flow).
     * 'pagado' is no longer an operational state – use payment_status instead.
     */
    const ESTADOS_OPERATIVOS = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

    /**
     * Valid payment states (financial/cashier flow).
     */
    const PAYMENT_STATUSES = ['pending', 'paid', 'cancelled', 'refunded'];

    protected $fillable = [
        'cliente_id',
        'user_id',
        'mesa_id',
        'estado',
        'payment_status',
        'subtotal',
        'total',
        'notas',
        'canal',
    ];

    /**
     * Default attribute values
     */
    protected $attributes = [
        'payment_status' => 'pending',
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
     * Scope para pedidos activos (no cancelados)
     */
    public function scopeActivos($query)
    {
        return $query->whereNotIn('estado', ['cancelado']);
    }

    /**
     * Scope para pedidos pagados (por payment_status)
     */
    public function scopePagados($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope para pedidos pendientes de pago
     */
    public function scopePendientesDePago($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * ¿El pedido está pagado?
     */
    public function estaPagado(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Marcar el pedido como pagado.
     */
    public function marcarComoPagado(): void
    {
        $this->update(['payment_status' => 'paid']);
    }

    /**
     * Marcar el pedido como cancelado (pago).
     */
    public function marcarPagoComoCancelado(): void
    {
        $this->update(['payment_status' => 'cancelled']);
    }
}
