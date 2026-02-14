<?php

namespace App\Policies;

use App\Models\Plato;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PlatoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Plato $plato): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Plato $plato): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Plato $plato): bool
    {
        // Puede usar soft delete, así que permitimos eliminar
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Plato $plato): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Plato $plato): bool
    {
        return false;
    }
}
