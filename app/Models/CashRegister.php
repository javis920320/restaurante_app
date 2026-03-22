<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CashRegister extends Model
{
    protected $table = 'cash_registers';

    const ESTADOS = ['abierta', 'cerrada'];

    protected $fillable = [
        'nombre',
        'estado',
        'usuario_id',
    ];

    protected $casts = [
        'estado' => 'string',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function aperturas(): HasMany
    {
        return $this->hasMany(CashOpening::class, 'cash_register_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(CashMovement::class, 'cash_register_id');
    }

    public function aperturaActual(): HasOne
    {
        return $this->hasOne(CashOpening::class, 'cash_register_id')->where('estado', 'abierta')->latestOfMany();
    }
}
