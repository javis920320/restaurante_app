<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $this->authorize('gestionar usuarios');

        $users = User::with('roles')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn (User $user) => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'activo'     => $user->activo,
                'roles'      => $user->roles->pluck('name'),
                'created_at' => $user->created_at,
            ]);

        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(UserRequest $request)
    {
        $this->authorize('gestionar usuarios');

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'activo'   => $request->boolean('activo', true),
        ]);

        if ($request->filled('roles')) {
            $user->syncRoles($request->roles);
        }

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Update the specified user.
     */
    public function update(UserRequest $request, User $usuario)
    {
        $this->authorize('gestionar usuarios');

        $data = [
            'name'   => $request->name,
            'email'  => $request->email,
            'activo' => $request->boolean('activo', true),
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $usuario->update($data);

        if ($request->has('roles')) {
            $usuario->syncRoles($request->roles ?? []);
        }

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $usuario)
    {
        $this->authorize('gestionar usuarios');

        if ($usuario->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }

        $usuario->delete();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Toggle the active status of a user.
     */
    public function toggleActivo(User $usuario)
    {
        $this->authorize('gestionar usuarios');

        if ($usuario->id === auth()->id()) {
            return back()->with('error', 'No puedes desactivar tu propio usuario.');
        }

        $usuario->update(['activo' => ! $usuario->activo]);

        $estado = $usuario->activo ? 'activado' : 'desactivado';

        return back()->with('success', "Usuario {$estado} exitosamente.");
    }
}
