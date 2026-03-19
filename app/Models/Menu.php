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

    protected $casts = [
        'estado' => 'string',
    ];

    /**
     * Auto-generate slug on creation.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Menu $menu) {
            if (empty($menu->slug)) {
                $menu->slug = static::generateUniqueSlug($menu->nombre);
            }
        });
    }

    /**
     * Generate a unique slug from a name.
     */
    public static function generateUniqueSlug(string $nombre): string
    {
        $base = Str::slug($nombre);
        $slug = $base;
        $i = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    /**
     * Relationship with Restaurante.
     */
    public function restaurante(): BelongsTo
    {
        return $this->belongsTo(Restaurante::class);
    }

    /**
     * Relationship with Categorias.
     */
    public function categorias(): HasMany
    {
        return $this->hasMany(Categoria::class)->orderBy('orden')->orderBy('nombre');
    }

    /**
     * Scope for published menus.
     */
    public function scopePublicados($query)
    {
        return $query->where('estado', 'publicado');
    }

    /**
     * Whether the menu is published.
     */
    public function isPublicado(): bool
    {
        return $this->estado === 'publicado';
    }
}
