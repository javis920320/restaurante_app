<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashClosing extends Model
{
    protected $table = 'cash_closings';

    protected $fillable = [
        'cash_opening_id',
        'monto_teorico',
        'monto_real',
        'diferencia',
        'fecha_cierre',
        'notas',
    ];

    protected $casts = [
        'monto_teorico' => 'decimal:2',
        'monto_real' => 'decimal:2',
        'diferencia' => 'decimal:2',
        'fecha_cierre' => 'datetime',
    ];

    public function apertura(): BelongsTo
    {
        return $this->belongsTo(CashOpening::class, 'cash_opening_id');
    }
}
