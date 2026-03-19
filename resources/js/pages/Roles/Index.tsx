import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission, type Role } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface RolesIndexProps {
    roles: Role[];
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles y Permisos', href: '/roles' }];

// Group permissions by category prefix
function groupPermissions(permissions: Permission[]) {
    const groups: Record<string, Permission[]> = {};
    for (const perm of permissions) {
        const parts = perm.name.split(' ');
        // Use the last word as category key (e.g. "pedidos" from "ver pedidos")
        const category = parts[parts.length - 1];
        if (!groups[category]) groups[category] = [];
        groups[category].push(perm);
    }
    return groups;
}

export default function Index({ roles, permissions }: RolesIndexProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};

    const [showCreate, setShowCreate] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const permissionGroups = groupPermissions(permissions);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Roles y Permisos</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Define roles y configura los permisos de acceso del sistema
                        </p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Rol
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

                {/* Roles Grid */}
                {roles.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Shield className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-medium">No hay roles configurados</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Crea el primer rol para comenzar a gestionar el acceso
                            </p>
                            <Button className="mt-4" onClick={() => setShowCreate(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Primer Rol
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                onEdit={() => setEditingRole(role)}
                                onDelete={() =>
                                    confirmDelete === role.id
                                        ? router.delete(route('roles.destroy', role.id), {
                                              preserveScroll: true,
                                              onSuccess: () => setConfirmDelete(null),
                                          })
                                        : setConfirmDelete(role.id)
                                }
                                isConfirmingDelete={confirmDelete === role.id}
                                onCancelDelete={() => setConfirmDelete(null)}
                            />
                        ))}
                    </div>
                )}

                {/* All Permissions Reference */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permisos Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(permissionGroups).map(([group, perms]) => (
                                <div key={group} className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        {group}
                                    </p>
                                    {perms.map((perm) => (
                                        <Badge key={perm.id} variant="outline" className="mr-1 text-xs">
                                            {perm.name}
                                        </Badge>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Role Dialog */}
            {showCreate && (
                <RoleFormDialog permissions={permissions} onClose={() => setShowCreate(false)} />
            )}

            {/* Edit Role Dialog */}
            {editingRole && (
                <RoleFormDialog
                    role={editingRole}
                    permissions={permissions}
                    onClose={() => setEditingRole(null)}
                />
            )}
        </AppLayout>
    );
}

// ── RoleCard ──────────────────────────────────────────────────────────────────

interface RoleCardProps {
    role: Role;
    onEdit: () => void;
    onDelete: () => void;
    isConfirmingDelete: boolean;
    onCancelDelete: () => void;
}

function RoleCard({ role, onEdit, onDelete, isConfirmingDelete, onCancelDelete }: RoleCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {role.users_count ?? 0} usuario{(role.users_count ?? 0) !== 1 ? 's' : ''}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Permissions list */}
                <div className="flex min-h-[48px] flex-wrap gap-1">
                    {(role.permissions as string[])?.length > 0 ? (
                        (role.permissions as string[]).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400">Sin permisos asignados</span>
                    )}
                </div>

                {/* Actions */}
                {isConfirmingDelete ? (
                    <div className="space-y-2">
                        <p className="text-center text-xs font-medium text-red-600 dark:text-red-400">
                            ¿Confirmar eliminación?
                        </p>
                        <div className="flex gap-2">
                            <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={onDelete}>
                                Eliminar
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onCancelDelete}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                            <Edit className="mr-1 h-3 w-3" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            title="Eliminar rol"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── RoleFormDialog ────────────────────────────────────────────────────────────

interface RoleFormDialogProps {
    role?: Role;
    permissions: Permission[];
    onClose: () => void;
}

function RoleFormDialog({ role, permissions, onClose }: RoleFormDialogProps) {
    const isEdit = !!role;

    const form = useForm({
        name: role?.name ?? '',
        permissions: (role?.permissions as string[]) ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(route('roles.update', role!.id), {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            form.post(route('roles.store'), {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    const togglePermission = (permName: string) => {
        const current = form.data.permissions as string[];
        if (current.includes(permName)) {
            form.setData('permissions', current.filter((p) => p !== permName));
        } else {
            form.setData('permissions', [...current, permName]);
        }
    };

    const selectAll = () => form.setData('permissions', permissions.map((p) => p.name));
    const selectNone = () => form.setData('permissions', []);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Nombre del Rol</Label>
                        <Input
                            id="role-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="ej: supervisor"
                            required
                        />
                        {form.errors.name && (
                            <p className="text-sm text-red-600">{form.errors.name}</p>
                        )}
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Permisos</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                    onClick={selectAll}
                                >
                                    Todos
                                </button>
                                <span className="text-xs text-gray-400">|</span>
                                <button
                                    type="button"
                                    className="text-xs text-gray-600 hover:underline dark:text-gray-400"
                                    onClick={selectNone}
                                >
                                    Ninguno
                                </button>
                            </div>
                        </div>

                        <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-3 dark:border-gray-700">
                            {permissions.map((perm) => (
                                <div key={perm.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`perm-${perm.id}`}
                                        checked={(form.data.permissions as string[]).includes(perm.name)}
                                        onCheckedChange={() => togglePermission(perm.name)}
                                    />
                                    <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer font-normal">
                                        {perm.name}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        {form.errors.permissions && (
                            <p className="text-sm text-red-600">{form.errors.permissions}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Rol'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
