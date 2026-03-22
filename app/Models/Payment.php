<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $table = 'payments';

    const ESTADOS = ['pendiente', 'parcial', 'pagado'];

    const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'mixto'];

    protected $fillable = [
        'pedido_id',
        'cash_opening_id',
        'monto_total',
        'monto_pagado',
        'cambio',
        'estado',
        'metodo_pago',
        'usuario_id',
        'fecha',
    ];

    protected $casts = [
        'monto_total' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'cambio' => 'decimal:2',
        'fecha' => 'datetime',
    ];

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function cashOpening(): BelongsTo
    {
        return $this->belongsTo(CashOpening::class, 'cash_opening_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(PaymentDetail::class, 'payment_id');
    }
}
