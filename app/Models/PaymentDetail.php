<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentDetail extends Model
{
    protected $table = 'payment_details';

    const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

    protected $fillable = [
        'payment_id',
        'metodo_pago',
        'monto',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
