import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, BookOpen, ChefHat, ClipboardList, CreditCard, Folder, GlassWater, LayoutGrid, MenuSquare, Settings, Shield, Table2, UserCog, UtensilsCrossed } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pedidos',
        href: '/pedidos',
        icon: ClipboardList,
    },
    {
        title: 'Cocina (KDS)',
        href: '/cocina',
        icon: ChefHat,
    },
    {
        title: 'Bar (KDS)',
        href: '/bar',
        icon: GlassWater,
    },
    {
        title: 'Caja',
        href: '/caja',
        icon: CreditCard,
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: BarChart3,
    },
];

const configNavItems: NavItem[] = [
    {
        title: 'Mesas',
        href: '/configuracion/mesas',
        icon: Table2,
    },
    {
        title: 'Platos',
        href: '/configuracion/platos',
        icon: UtensilsCrossed,
    },
    {
        title: 'Categorías',
        href: '/categorias',
        icon: Settings,
    },
    {
        title: 'Menús',
        href: '/configuracion/menus',
        icon: MenuSquare,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
        icon: UserCog,
    },
    {
        title: 'Roles y Permisos',
        href: '/roles',
        icon: Shield,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { can } = usePermissions();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Operaciones" />
                <NavMain items={configNavItems} label="Configuración" />
                {(can('gestionar usuarios') || can('gestionar roles')) && (
                    <NavMain items={adminNavItems} label="Administración" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
