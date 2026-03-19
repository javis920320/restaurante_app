import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

/**
 * Hook to check the current user's roles and permissions.
 */
export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    const can = (permission: string): boolean => {
        return auth.permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        return auth.roles.includes(role);
    };

    const hasAnyRole = (...roles: string[]): boolean => {
        return roles.some((role) => auth.roles.includes(role));
    };

    return { can, hasRole, hasAnyRole, roles: auth.roles, permissions: auth.permissions };
}
