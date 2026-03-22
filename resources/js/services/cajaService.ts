import api from './api';

export interface CashRegister {
    id: number;
    nombre: string;
    estado: 'abierta' | 'cerrada';
    usuario_id: number | null;
    apertura_activa?: CashOpening | null;
    created_at: string;
    updated_at: string;
}

export interface CashOpening {
    id: number;
    cash_register_id: number;
    usuario_id: number;
    monto_inicial: number;
    fecha_apertura: string;
    estado: 'abierta' | 'cerrada';
}

export interface CashMovement {
    id: number;
    cash_register_id: number;
    cash_opening_id: number | null;
    tipo: 'ingreso' | 'egreso';
    subtipo: string;
    monto: number;
    metodo_pago: string;
    referencia_id: number | null;
    descripcion: string | null;
    usuario_id: number | null;
    fecha: string;
    created_at: string;
}

export interface CashSummary {
    monto_inicial: number;
    total_ingresos: number;
    total_egresos: number;
    saldo_actual: number;
    monto_teorico: number;
}

export interface Payment {
    id: number;
    pedido_id: number;
    monto_total: number;
    monto_pagado: number;
    cambio: number;
    estado: string;
    metodo_pago: string;
    fecha: string;
}

const cajaService = {
    // Cash registers
    getCashRegisters: () =>
        api.get<{ registros: CashRegister[] }>('/admin/caja/registros'),
    createCashRegister: (nombre: string) =>
        api.post<{ registro: CashRegister }>('/admin/caja/registros', { nombre }),

    // Opening/closing
    abrirCaja: (registroId: number, montoInicial: number) =>
        api.post<{ apertura: CashOpening; message: string }>(
            `/admin/caja/registros/${registroId}/abrir`,
            { monto_inicial: montoInicial },
        ),
    cerrarCaja: (registroId: number, montoReal: number, notas?: string) =>
        api.post<{ cierre: unknown; message: string }>(
            `/admin/caja/registros/${registroId}/cerrar`,
            { monto_real: montoReal, notas },
        ),

    // Movements
    getMovimientos: (registroId: number) =>
        api.get<{ movimientos: CashMovement[] }>(
            `/admin/caja/registros/${registroId}/movimientos`,
        ),
    registrarMovimiento: (
        registroId: number,
        data: {
            tipo: string;
            subtipo: string;
            monto: number;
            metodo_pago?: string;
            descripcion?: string;
        },
    ) =>
        api.post<{ movimiento: CashMovement; message: string }>(
            `/admin/caja/registros/${registroId}/movimientos`,
            data,
        ),

    // Summary
    getResumen: (registroId: number) =>
        api.get<CashSummary>(`/admin/caja/registros/${registroId}/resumen`),

    // Payments
    registrarPago: (data: {
        pedido_id: number;
        monto_pagado: number;
        metodo_pago: string;
        cash_register_id?: number;
    }) => api.post<{ payment: Payment; message: string }>('/admin/caja/pagos', data),
    getPagosByPedido: (pedidoId: number) =>
        api.get<{ payments: Payment[] }>(`/admin/caja/pagos/pedido/${pedidoId}`),
};

export default cajaService;
