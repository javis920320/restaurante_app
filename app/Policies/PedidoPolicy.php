<?php

namespace App\Policies;

use App\Models\Pedido;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PedidoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Todos los usuarios autenticados pueden ver la lista de pedidos
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Pedido $pedido): bool
    {
        // Todos los usuarios autenticados pueden ver un pedido
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Todos los usuarios autenticados pueden crear pedidos
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Pedido $pedido): bool
    {
        // Solo pueden actualizar si el pedido no está pagado o cancelado
        return !in_array($pedido->estado, ['pagado', 'cancelado']);
    }

    /**
     * Determine whether the user can change the order status.
     */
    public function cambiarEstado(User $user, Pedido $pedido): bool
    {
        // Solo pueden cambiar estado si no está pagado o cancelado
        return !in_array($pedido->estado, ['pagado', 'cancelado']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Pedido $pedido): bool
    {
        // Solo pueden cancelar si está pendiente o confirmado
        return in_array($pedido->estado, ['pendiente', 'confirmado']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Pedido $pedido): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Pedido $pedido): bool
    {
        // Solo administradores (puede extenderse con roles)
        return false;
    }
}
