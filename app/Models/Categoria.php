<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Categoria extends Model
{

    use HasFactory;

    const PRODUCTION_AREAS = ['kitchen', 'bar', 'none'];

    protected $fillable = [
        'menu_id',
        'nombre',
        'activo',
        'orden',
        'production_area',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    //relaciones con los modelos
    public function platos()
    {
        return $this->hasMany(Plato::class);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Scope para categorías activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Verifica si la categoría tiene productos activos asociados
     */
    public function tieneProductosActivos(): bool
    {
        return $this->platos()->where('activo', true)->exists();
    }
}
