import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role, type User } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Plus, Power, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
    };
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usuarios', href: '/usuarios' }];

export default function Index({ users, roles }: UsersIndexProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};

    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const usersData = users.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Usuarios" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Administra los usuarios, roles y accesos del sistema
                        </p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Usuario
                    </Button>
                </div>

                {/* Flash messages */}
                {flash.success && (
                    <div className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
                                    <p className="text-2xl font-bold">{users.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                    <Power className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {usersData.filter((u) => u.activo).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {usersData.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                No hay usuarios registrados
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                            <th className="pb-3 pr-4 font-medium">Nombre</th>
                                            <th className="pb-3 pr-4 font-medium">Email</th>
                                            <th className="pb-3 pr-4 font-medium">Roles</th>
                                            <th className="pb-3 pr-4 font-medium">Estado</th>
                                            <th className="pb-3 font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersData.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-0 dark:border-gray-700"
                                            >
                                                <td className="py-3 pr-4 font-medium">{user.name}</td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                                                    {user.email}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(user.roles as string[])?.map((role) => (
                                                            <Badge key={role} variant="secondary" className="text-xs">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                        {(!user.roles || (user.roles as string[]).length === 0) && (
                                                            <span className="text-xs text-gray-400">Sin rol</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge
                                                        variant={user.activo ? 'default' : 'secondary'}
                                                        className={
                                                            user.activo
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }
                                                    >
                                                        {user.activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditingUser(user)}
                                                            title="Editar usuario"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    route('usuarios.toggle-activo', user.id),
                                                                    {},
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                            title={user.activo ? 'Desactivar' : 'Activar'}
                                                            className={
                                                                user.activo
                                                                    ? 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950'
                                                                    : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                                                            }
                                                        >
                                                            <Power className="h-3 w-3" />
                                                        </Button>
                                                        {confirmDelete === user.id ? (
                                                            <>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        router.delete(
                                                                            route('usuarios.destroy', user.id),
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess: () =>
                                                                                    setConfirmDelete(null),
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    ¿Confirmar?
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setConfirmDelete(null)}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setConfirmDelete(user.id)}
                                                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                                title="Eliminar usuario"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === users.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(route('usuarios.index'), { page })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create User Dialog */}
            {showCreate && (
                <UserFormDialog
                    roles={roles}
                    onClose={() => setShowCreate(false)}
                />
            )}

            {/* Edit User Dialog */}
            {editingUser && (
                <UserFormDialog
                    user={editingUser}
                    roles={roles}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </AppLayout>
    );
}

interface UserFormDialogProps {
    user?: User;
    roles: Role[];
    onClose: () => void;
}

function UserFormDialog({ user, roles, onClose }: UserFormDialogProps) {
    const isEdit = !!user;

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        activo: user?.activo ?? true,
        roles: (user?.roles as string[]) ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(route('usuarios.update', user!.id), {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            form.post(route('usuarios.store'), {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    const toggleRole = (roleName: string) => {
        const current = form.data.roles as string[];
        if (current.includes(roleName)) {
            form.setData('roles', current.filter((r) => r !== roleName));
        } else {
            form.setData('roles', [...current, roleName]);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        {form.errors.name && (
                            <p className="text-sm text-red-600">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                        />
                        {form.errors.email && (
                            <p className="text-sm text-red-600">{form.errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {isEdit ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            required={!isEdit}
                        />
                        {form.errors.password && (
                            <p className="text-sm text-red-600">{form.errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(e) => form.setData('password_confirmation', e.target.value)}
                            required={!isEdit || form.data.password !== ''}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="activo"
                            checked={form.data.activo}
                            onCheckedChange={(checked) => form.setData('activo', !!checked)}
                        />
                        <Label htmlFor="activo">Usuario activo</Label>
                    </div>

                    {/* Roles */}
                    <div className="space-y-2">
                        <Label>Roles</Label>
                        <div className="grid grid-cols-2 gap-2 rounded-md border p-3 dark:border-gray-700">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={(form.data.roles as string[]).includes(role.name)}
                                        onCheckedChange={() => toggleRole(role.name)}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="font-normal capitalize">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {form.errors.roles && (
                            <p className="text-sm text-red-600">{form.errors.roles}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
