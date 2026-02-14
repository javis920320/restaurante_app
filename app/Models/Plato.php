<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Plato extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nombre',
        'precio',
        'descripcion',
        'categoria_id',
        'restaurante_id',
        'imagen',
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'activo' => 'boolean',
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
     * Scope para productos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para productos por categoría
     */
    public function scopePorCategoria($query, $categoriaId)
    {
        return $query->where('categoria_id', $categoriaId);
    }
}
