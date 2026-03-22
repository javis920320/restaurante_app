<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CashOpening extends Model
{
    protected $table = 'cash_openings';

    const ESTADOS = ['abierta', 'cerrada'];

    protected $fillable = [
        'cash_register_id',
        'usuario_id',
        'monto_inicial',
        'fecha_apertura',
        'estado',
    ];

    protected $casts = [
        'monto_inicial' => 'decimal:2',
        'fecha_apertura' => 'datetime',
    ];

    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function cierre(): HasOne
    {
        return $this->hasOne(CashClosing::class, 'cash_opening_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(CashMovement::class, 'cash_opening_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Payment::class, 'cash_opening_id');
    }
}
