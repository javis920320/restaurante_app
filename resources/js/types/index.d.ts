import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    roles: string[];
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Permission {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions?: string[];
    users_count?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    activo: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Categoria {
    id: number;
    menu_id?: number | null;
    nombre: string;
    activo: boolean;
    orden: number;
    platos_count?: number;
    platos?: Plato[];
    created_at: string;
    updated_at: string;
}

export interface Menu {
    id: number;
    restaurante_id: number;
    nombre: string;
    slug: string;
    estado: 'borrador' | 'publicado';
    categorias_count?: number;
    categorias?: Categoria[];
    restaurante?: Restaurante;
    created_at: string;
    updated_at: string;
}

export interface Restaurante {
    id: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface Opcion {
    id: number;
    plato_id: number;
    nombre: string;
    precio_extra: number;
    orden: number;
    created_at: string;
    updated_at: string;
}

export interface Plato {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id: number;
    restaurante_id: number;
    activo: boolean;
    disponible: boolean;
    orden: number;
    stock?: number | null;
    production_area: 'kitchen' | 'bar' | 'none';
    created_at: string;
    updated_at: string;
    imagen: string;
    opciones?: Opcion[];
    categoria?: Categoria;
}

export interface PedidoDetalle {
    id: number;
    pedido_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    notas?: string | null;
    production_area: 'kitchen' | 'bar' | 'none';
    estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';
    created_at: string;
    updated_at: string;
    producto?: Plato;
}
