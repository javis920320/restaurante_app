import { useCallback, useEffect, useState } from 'react';
import cajaService, { CashMovement, CashRegister, CashSummary } from '@/services/cajaService';

interface UseCajaResult {
    registros: CashRegister[];
    selectedRegistro: CashRegister | null;
    movimientos: CashMovement[];
    resumen: CashSummary | null;
    loading: boolean;
    error: string | null;

    selectRegistro: (registro: CashRegister) => void;
    createRegistro: (nombre: string) => Promise<void>;
    abrirCaja: (montoInicial: number) => Promise<void>;
    cerrarCaja: (montoReal: number, notas?: string) => Promise<void>;
    registrarMovimiento: (
        tipo: string,
        subtipo: string,
        monto: number,
        metodoPago?: string,
        descripcion?: string,
    ) => Promise<void>;
    refetch: () => void;
}

export const useCaja = (): UseCajaResult => {
    const [registros, setRegistros] = useState<CashRegister[]>([]);
    const [selectedRegistro, setSelectedRegistro] = useState<CashRegister | null>(null);
    const [movimientos, setMovimientos] = useState<CashMovement[]>([]);
    const [resumen, setResumen] = useState<CashSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    // Load all registers
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await cajaService.getCashRegisters();
                setRegistros(res.data.registros);
                setError(null);

                // Keep selectedRegistro in sync with fresh data
                setSelectedRegistro((prev) => {
                    if (!prev) return null;
                    return res.data.registros.find((r) => r.id === prev.id) ?? null;
                });
            } catch {
                setError('Error al cargar los registros de caja');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [refreshKey]);

    // Load movements + summary when a register is selected
    useEffect(() => {
        if (!selectedRegistro) {
            setMovimientos([]);
            setResumen(null);
            return;
        }

        const loadDetails = async () => {
            try {
                const [movRes, resRes] = await Promise.all([
                    cajaService.getMovimientos(selectedRegistro.id),
                    selectedRegistro.estado === 'abierta'
                        ? cajaService.getResumen(selectedRegistro.id)
                        : Promise.resolve(null),
                ]);
                setMovimientos(movRes.data.movimientos);
                setResumen(resRes ? resRes.data : null);
            } catch {
                setError('Error al cargar detalles del registro');
            }
        };

        loadDetails();
    }, [selectedRegistro, refreshKey]);

    const selectRegistro = useCallback((registro: CashRegister) => {
        setSelectedRegistro(registro);
    }, []);

    const createRegistro = useCallback(
        async (nombre: string) => {
            await cajaService.createCashRegister(nombre);
            refetch();
        },
        [refetch],
    );

    const abrirCaja = useCallback(
        async (montoInicial: number) => {
            if (!selectedRegistro) throw new Error('No hay registro seleccionado');
            await cajaService.abrirCaja(selectedRegistro.id, montoInicial);
            refetch();
        },
        [selectedRegistro, refetch],
    );

    const cerrarCaja = useCallback(
        async (montoReal: number, notas?: string) => {
            if (!selectedRegistro) throw new Error('No hay registro seleccionado');
            await cajaService.cerrarCaja(selectedRegistro.id, montoReal, notas);
            refetch();
        },
        [selectedRegistro, refetch],
    );

    const registrarMovimiento = useCallback(
        async (
            tipo: string,
            subtipo: string,
            monto: number,
            metodoPago = 'efectivo',
            descripcion?: string,
        ) => {
            if (!selectedRegistro) throw new Error('No hay registro seleccionado');
            await cajaService.registrarMovimiento(selectedRegistro.id, {
                tipo,
                subtipo,
                monto,
                metodo_pago: metodoPago,
                descripcion,
            });
            refetch();
        },
        [selectedRegistro, refetch],
    );

    return {
        registros,
        selectedRegistro,
        movimientos,
        resumen,
        loading,
        error,
        selectRegistro,
        createRegistro,
        abrirCaja,
        cerrarCaja,
        registrarMovimiento,
        refetch,
    };
};
