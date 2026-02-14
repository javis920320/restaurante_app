<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurante extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'email',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Relación con mesas
     */
    public function mesas(): HasMany
    {
        return $this->hasMany(Mesa::class);
    }

    /**
     * Relación con productos/platos
     */
    public function platos(): HasMany
    {
        return $this->hasMany(Plato::class);
    }

    /**
     * Scope para restaurantes activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
