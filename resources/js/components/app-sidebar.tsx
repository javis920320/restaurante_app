import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, BookOpen, ChefHat, ClipboardList, Folder, LayoutGrid, MenuSquare, Settings, Table2, UtensilsCrossed } from 'lucide-react';
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
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
