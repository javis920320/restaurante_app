<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of roles with their permissions.
     */
    public function index(Request $request)
    {
        $this->authorize('gestionar roles');

        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users_count,
            ]);

        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Roles/Index', [
            'roles'       => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(RoleRequest $request)
    {
        $this->authorize('gestionar roles');

        $role = Role::create(['name' => $request->name]);

        if ($request->filled('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Rol creado exitosamente.');
    }

    /**
     * Update the specified role.
     */
    public function update(RoleRequest $request, Role $role)
    {
        $this->authorize('gestionar roles');

        $role->update(['name' => $request->name]);

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('roles.index')
            ->with('success', 'Rol actualizado exitosamente.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        $this->authorize('gestionar roles');

        if ($role->users()->count() > 0) {
            return back()->with('error', 'No se puede eliminar un rol que tiene usuarios asignados.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Rol eliminado exitosamente.');
    }
}
