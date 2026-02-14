<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Mesa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'capacidad',
        'estado',
        'qr_token',
        'restaurante_id',
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
    ];

    /**
     * Boot del modelo para generar token QR automáticamente
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mesa) {
            if (empty($mesa->qr_token)) {
                $mesa->qr_token = Str::uuid()->toString();
            }
        });
    }

    /**
     * Relación con restaurante
     */
    public function restaurante(): BelongsTo
    {
        return $this->belongsTo(Restaurante::class);
    }

    /**
     * Relación con pedidos
     */
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    /**
     * Scope para mesas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    /**
     * Scope para mesas disponibles
     */
    public function scopeDisponibles($query)
    {
        return $query->where('estado', 'disponible')->where('activa', true);
    }

    /**
     * Scope para buscar por token
     */
    public function scopePorToken($query, $token)
    {
        return $query->where('qr_token', $token);
    }
}
