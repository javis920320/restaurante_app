<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Menu extends Model
{
    protected $fillable = [
        'restaurante_id',
        'nombre',
        'slug',
        'estado',
    ];

    protected static function booted(): void
    {
        static::creating(function (Menu $menu) {
            if (empty($menu->slug)) {
                $menu->slug = static::generarSlugUnico($menu->nombre);
            }
        });

        static::updating(function (Menu $menu) {
            if ($menu->isDirty('nombre') && !$menu->isDirty('slug')) {
                $menu->slug = static::generarSlugUnico($menu->nombre, $menu->id);
            }
        });
    }

    protected static function generarSlugUnico(string $nombre, ?int $excludeId = null): string
    {
        $slug = Str::slug($nombre);
        $original = $slug;
        $count = 1;

        while (true) {
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            if (!$query->exists()) {
                break;
            }
            $slug = $original . '-' . $count++;
        }

        return $slug;
    }

    public function restaurante(): BelongsTo
    {
        return $this->belongsTo(Restaurante::class);
    }

    public function categorias(): HasMany
    {
        return $this->hasMany(Categoria::class);
    }

    public function estaPublicado(): bool
    {
        return $this->estado === 'publicado';
    }

    public function scopePublicados($query)
    {
        return $query->where('estado', 'publicado');
    }
}
