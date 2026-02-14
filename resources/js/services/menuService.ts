import api from './api';

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    activo: boolean;
    categoria_id: number;
}

export interface Categoria {
    id: number;
    nombre: string;
    productos: Producto[];
}

export interface Mesa {
    id: number;
    nombre: string;
    qr_token: string;
}

export interface Restaurante {
    nombre: string;
    direccion: string;
}

export interface MenuData {
    mesa: Mesa;
    restaurante: Restaurante;
    menu: Categoria[];
}

/**
 * Obtiene el menú disponible para una mesa mediante su token QR
 * Nota: Este endpoint NO es de la API, es una ruta web que devuelve props de Inertia
 * Este servicio está aquí para documentación, pero el menú se obtiene desde las props de Inertia
 */
const menuService = {
    /**
     * En el caso de Inertia.js, el menú se obtiene directamente desde las props
     * que vienen del servidor cuando se renderiza la página
     * No necesitamos hacer una llamada API separada
     */
    getMenuFromProps: (props: MenuData): MenuData => {
        return props;
    },
};

export default menuService;
