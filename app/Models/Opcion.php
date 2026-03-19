<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Opcion extends Model
{
    protected $table = 'opciones';

    protected $fillable = [
        'plato_id',
        'nombre',
        'precio_extra',
        'orden',
    ];

    protected $casts = [
        'precio_extra' => 'decimal:2',
    ];

    /**
     * Relación con plato
     */
    public function plato(): BelongsTo
    {
        return $this->belongsTo(Plato::class);
    }
}
