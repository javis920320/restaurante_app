<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plato extends Model
{
    use SoftDeletes;

    const PRODUCTION_AREAS = ['kitchen', 'bar', 'none'];

    protected $fillable = [
        'nombre',
        'precio',
        'descripcion',
        'categoria_id',
        'restaurante_id',
        'imagen',
        'activo',
        'disponible',
        'orden',
        'stock',
        'production_area',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'activo' => 'boolean',
        'disponible' => 'boolean',
    ];

    protected $attributes = [
        'production_area' => 'none',
    ];

    /**
     * Relación con categoría
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    /**
     * Relación con restaurante
     */
    public function restaurante(): BelongsTo
    {
        return $this->belongsTo(Restaurante::class);
    }

    /**
     * Relación con opciones/variantes
     */
    public function opciones(): HasMany
    {
        return $this->hasMany(Opcion::class)->orderBy('orden');
    }

    /**
     * Scope para productos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para productos disponibles
     */
    public function scopeDisponibles($query)
    {
        return $query->where('disponible', true);
    }

    /**
     * Scope para productos por categoría
     */
    public function scopePorCategoria($query, $categoriaId)
    {
        return $query->where('categoria_id', $categoriaId);
    }
}
