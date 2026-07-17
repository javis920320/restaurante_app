import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCaja } from '@/hooks/useCaja';
import { useCajaKDS, type CajaData, type PedidoCaja } from '@/hooks/useCajaKDS';
import AppLayout from '@/layouts/app-layout';
import cajaService, { CashMovement, CashRegister, CashSummary } from '@/services/cajaService';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Lock,
    PiggyBank,
    Plus,
    Receipt,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Caja', href: '/caja' },
];

type MainTab = 'pedidos' | 'caja' | 'movimientos';

interface Props {
    initialPedidos?: CajaData;
}

export default function Index({ initialPedidos }: Props) {
    const kds = useCajaKDS({ pollingInterval: 15, initialData: initialPedidos });
    const caja = useCaja();
    const [mainTab, setMainTab] = useState<MainTab>('pedidos');

    const pendingCount = kds.data.pending.length;
    const paidCount = kds.data.paid.length;
    const pendingTotal = kds.data.pending.reduce((sum, p) => sum + p.total, 0);

    const handleRefreshAll = () => {
        kds.refetch();
        caja.refetch();
    };

    const activeCaja = caja.registros.find((r) => r.estado === 'abierta') ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Caja" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-600 p-3">
                            <CreditCard className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-foreground text-3xl font-bold">Panel de Caja</h1>
                            <p className="text-muted-foreground text-sm">
                                {pendingCount} pedido(s) pendientes de pago • ${pendingTotal.toFixed(2)} por cobrar
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleRefreshAll} variant="outline" size="sm" className="hover:bg-muted">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
                {activeCaja && caja.selectedRegistro?.id === activeCaja.id && caja.resumen && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card className="border-emerald-200 bg-emerald-50/20 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Saldo en Caja</CardTitle>
                                <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ${caja.resumen.saldo_actual.toFixed(2)}
                                </div>
                                <p className="text-muted-foreground mt-1 text-[10px]">Efectivo total en caja</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Ventas / Ingresos
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">${caja.resumen.total_ingresos.toFixed(2)}</div>
                                <p className="text-muted-foreground mt-1 text-[10px]">Total cobrado hoy</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Egresos / Gastos
                                </CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">${caja.resumen.total_egresos.toFixed(2)}</div>
                                <p className="text-muted-foreground mt-1 text-[10px]">Salidas registradas</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Registro Activo
                                </CardTitle>
                                <Lock className="h-4 w-4 text-indigo-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="truncate text-lg font-bold">{activeCaja.nombre}</div>
                                <p className="text-muted-foreground mt-1 truncate text-[10px]">
                                    Abierta:{' '}
                                    {new Date(activeCaja.apertura_actual?.fecha_apertura ?? '').toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Box closed warning banner */}
                {!activeCaja && (
                    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4 text-yellow-800 shadow-sm dark:border-yellow-900/30 dark:bg-yellow-950/10 dark:text-yellow-200">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                        <div className="flex-1 text-sm">
                            <span className="font-semibold">Caja actualmente cerrada.</span> Debes abrir un registro de caja para poder registrar
                            cobros o movimientos manuales. Ve a la pestaña <span className="font-semibold">"Caja"</span> para realizar la apertura.
                        </div>
                    </div>
                )}

                {/* Main Tabs */}
                <div className="flex gap-2 border-b">
                    <TabButton
                        active={mainTab === 'pedidos'}
                        onClick={() => setMainTab('pedidos')}
                        icon={<Wallet className="h-4 w-4" />}
                        label="Pedidos"
                        badge={pendingCount > 0 ? pendingCount : undefined}
                        badgeColor="yellow"
                    />
                    <TabButton
                        active={mainTab === 'caja'}
                        onClick={() => setMainTab('caja')}
                        icon={<Lock className="h-4 w-4" />}
                        label="Caja"
                        badge={caja.registros.filter((r) => r.estado === 'abierta').length || undefined}
                        badgeColor="green"
                    />
                    <TabButton
                        active={mainTab === 'movimientos'}
                        onClick={() => setMainTab('movimientos')}
                        icon={<ArrowUpCircle className="h-4 w-4" />}
                        label="Movimientos"
                    />
                </div>

                {/* Tab: Pedidos */}
                {mainTab === 'pedidos' && (
                    <PedidosTab
                        kds={kds}
                        paidCount={paidCount}
                        activeRegistroId={caja.registros.find((r) => r.estado === 'abierta')?.id ?? null}
                        onPaymentSuccess={kds.refetch}
                    />
                )}

                {/* Tab: Caja */}
                {mainTab === 'caja' && <CajaTab caja={caja} />}

                {/* Tab: Movimientos */}
                {mainTab === 'movimientos' && <MovimientosTab caja={caja} />}
            </div>
        </AppLayout>
    );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
    badgeColor?: 'yellow' | 'green';
}

function TabButton({ active, onClick, icon, label, badge, badgeColor = 'yellow' }: TabButtonProps) {
    const badgeClass =
        badgeColor === 'green'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-400';

    return (
        <button
            onClick={onClick}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-2 text-sm font-medium transition-colors ${
                active
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
        >
            {icon}
            {label}
            {badge !== undefined && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}>{badge}</span>}
        </button>
    );
}

// ─── Pedidos Tab ─────────────────────────────────────────────────────────────

interface PedidosTabProps {
    kds: ReturnType<typeof useCajaKDS>;
    paidCount: number;
    activeRegistroId: number | null;
    onPaymentSuccess: () => void;
}

function PedidosTab({ kds, paidCount, activeRegistroId, onPaymentSuccess }: PedidosTabProps) {
    const [subTab, setSubTab] = useState<'pending' | 'paid'>('pending');
    const [cobrandoPedido, setCobrandoPedido] = useState<PedidoCaja | null>(null);

    return (
        <>
            <div className="flex gap-2 border-b">
                <TabButton
                    active={subTab === 'pending'}
                    onClick={() => setSubTab('pending')}
                    icon={<Wallet className="h-4 w-4" />}
                    label="Pendientes de Pago"
                    badge={kds.data.pending.length || undefined}
                    badgeColor="yellow"
                />
                <TabButton
                    active={subTab === 'paid'}
                    onClick={() => setSubTab('paid')}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Pagados"
                    badge={paidCount || undefined}
                    badgeColor="green"
                />
            </div>

            {kds.loading && kds.data.pending.length === 0 && kds.data.paid.length === 0 ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {subTab === 'pending' && (
                        <>
                            {kds.data.pending.length === 0 ? (
                                <EmptyState icon={<CheckCircle2 />} title="¡Sin pendientes!" message="Todos los pedidos han sido cobrados" />
                            ) : (
                                kds.data.pending.map((pedido) => (
                                    <PedidoCajaCard
                                        key={pedido.id}
                                        pedido={pedido}
                                        onMarcarPagado={() => kds.marcarComoPagado(pedido.id)}
                                        onCerrarMesa={() => kds.cerrarMesa(pedido.id)}
                                        onCobrar={() => setCobrandoPedido(pedido)}
                                    />
                                ))
                            )}
                        </>
                    )}

                    {subTab === 'paid' && (
                        <>
                            {kds.data.paid.length === 0 ? (
                                <EmptyState icon={<CreditCard />} title="Sin cobros registrados" message="Los pedidos pagados aparecerán aquí" />
                            ) : (
                                kds.data.paid.map((pedido) => <PedidoCajaCard key={pedido.id} pedido={pedido} readonly />)
                            )}
                        </>
                    )}
                </div>
            )}

            {cobrandoPedido && (
                <PagoModal
                    pedido={cobrandoPedido}
                    activeRegistroId={activeRegistroId}
                    onClose={() => setCobrandoPedido(null)}
                    onSuccess={() => {
                        setCobrandoPedido(null);
                        onPaymentSuccess();
                    }}
                />
            )}
        </>
    );
}

// ─── Pago Modal ──────────────────────────────────────────────────────────────

interface PagoModalProps {
    pedido: PedidoCaja;
    activeRegistroId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

function PagoModal({ pedido, activeRegistroId, onClose, onSuccess }: PagoModalProps) {
    const [montoPagado, setMontoPagado] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mixed payment states
    const [efectivo, setEfectivo] = useState('');
    const [tarjeta, setTarjeta] = useState('');
    const [transferencia, setTransferencia] = useState('');

    const isMixto = metodoPago === 'mixto';

    const getMontoTotalRecibido = () => {
        if (isMixto) {
            return (parseFloat(efectivo) || 0) + (parseFloat(tarjeta) || 0) + (parseFloat(transferencia) || 0);
        }
        return parseFloat(montoPagado) || 0;
    };

    const totalRecibido = getMontoTotalRecibido();
    const cambio = Math.max(0, totalRecibido - pedido.total);
    const insuficiente = totalRecibido > 0 && totalRecibido < pedido.total;

    // Helper for fast denominations
    const getCashOptions = (total: number) => {
        const options = [total];
        const common = [5, 10, 20, 50, 100, 200];
        common.forEach((val) => {
            if (val > total && val < total * 3 && !options.includes(val)) {
                options.push(val);
            }
        });
        const ceiling5 = Math.ceil(total / 5) * 5;
        if (ceiling5 > total && !options.includes(ceiling5)) options.push(ceiling5);
        const ceiling10 = Math.ceil(total / 10) * 10;
        if (ceiling10 > total && !options.includes(ceiling10)) options.push(ceiling10);
        const ceiling20 = Math.ceil(total / 20) * 20;
        if (ceiling20 > total && !options.includes(ceiling20)) options.push(ceiling20);
        const ceiling50 = Math.ceil(total / 50) * 50;
        if (ceiling50 > total && !options.includes(ceiling50)) options.push(ceiling50);

        return Array.from(new Set(options))
            .sort((a, b) => a - b)
            .slice(0, 5);
    };

    const cashOptions = getCashOptions(pedido.total);

    const handleQuickCash = (amount: number) => {
        if (isMixto) {
            setEfectivo(amount.toFixed(2));
        } else {
            setMontoPagado(amount.toFixed(2));
        }
    };

    const handleConfirmar = async () => {
        if (totalRecibido <= 0) {
            setError('Ingrese el monto recibido');
            return;
        }
        if (insuficiente) {
            setError('El monto recibido es insuficiente');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const payload: {
                pedido_id: number;
                monto_pagado: number;
                metodo_pago: string;
                cash_register_id?: number;
                detalles_pago?: { metodo_pago: string; monto: number }[];
            } = {
                pedido_id: pedido.id,
                monto_pagado: totalRecibido,
                metodo_pago: metodoPago,
                ...(activeRegistroId ? { cash_register_id: activeRegistroId } : {}),
            };

            if (isMixto) {
                const detalles: { metodo_pago: string; monto: number }[] = [];
                const efVal = parseFloat(efectivo) || 0;
                const tjVal = parseFloat(tarjeta) || 0;
                const tfVal = parseFloat(transferencia) || 0;

                if (efVal > 0) detalles.push({ metodo_pago: 'efectivo', monto: efVal });
                if (tjVal > 0) detalles.push({ metodo_pago: 'tarjeta', monto: tjVal });
                if (tfVal > 0) detalles.push({ metodo_pago: 'transferencia', monto: tfVal });

                payload.detalles_pago = detalles;
            }

            await cajaService.registrarPago(payload);
            onSuccess();
        } catch (err) {
            const apiError = err as { response?: { data?: { message?: string } } };
            setError(apiError.response?.data?.message || 'Error al registrar el pago. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill exact total for non-cash methods when selected
    useEffect(() => {
        if (metodoPago === 'tarjeta' || metodoPago === 'transferencia') {
            setMontoPagado(pedido.total.toFixed(2));
        } else if (metodoPago === 'efectivo') {
            setMontoPagado('');
        }
    }, [metodoPago, pedido.total]);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border-border bg-card sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Cobrar Pedido #{pedido.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-2 grid gap-5 md:grid-cols-2">
                    {/* Left: pre-ticket */}
                    <div className="space-y-4">
                        <div className="border-muted-foreground/30 bg-muted/20 text-foreground dark:bg-muted/10 space-y-2 rounded-xl border border-dashed p-4 font-mono text-[11px] shadow-sm">
                            <div className="text-center text-xs font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                                TICKET PRE-COBRO
                            </div>
                            <div className="text-muted-foreground truncate text-center text-[9px]">
                                Mesa: {pedido.mesa_nombre} • ID: {pedido.id}
                            </div>
                            <Separator className="border-muted-foreground/20 my-2 border-t border-dashed bg-transparent" />

                            <div className="max-h-[140px] space-y-1.5 overflow-y-auto pr-1">
                                {pedido.productos_resumen.map((p, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-1">
                                        <span className="max-w-[140px] truncate">
                                            {p.cantidad}x {p.nombre}
                                        </span>
                                        <span className="text-muted-foreground font-semibold">incluido</span>
                                    </div>
                                ))}
                            </div>

                            <Separator className="border-muted-foreground/20 my-2 border-t border-dashed bg-transparent" />
                            <div className="flex justify-between pt-1 text-xs font-bold">
                                <span>TOTAL COBRAR:</span>
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">${pedido.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Quick cash buttons */}
                        {(metodoPago === 'efectivo' || metodoPago === 'mixto') && (
                            <div className="space-y-2">
                                <label className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                    Atajos de Efectivo
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {cashOptions.map((amount) => (
                                        <Button
                                            key={amount}
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleQuickCash(amount)}
                                            className="bg-muted h-8 text-[10px] font-semibold transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                                        >
                                            {amount === pedido.total ? 'Exacto' : `$${amount.toFixed(0)}`}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Payment details */}
                    <div className="flex flex-col justify-between space-y-4">
                        <div className="space-y-4">
                            {/* Método de pago */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Método de pago</label>
                                <Select value={metodoPago} onValueChange={setMetodoPago}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="mixto">Pago Mixto (Dividir)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment inputs depending on method */}
                            {!isMixto ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Monto recibido</label>
                                    <div className="relative">
                                        <span className="text-muted-foreground absolute top-2.5 left-3 text-sm font-medium">$</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder={`Mínimo $${pedido.total.toFixed(2)}`}
                                            value={montoPagado}
                                            onChange={(e) => setMontoPagado(e.target.value)}
                                            className={`pl-7 ${insuficiente ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                        />
                                    </div>
                                    {insuficiente && (
                                        <p className="text-xs font-medium text-red-500">Faltan ${(pedido.total - totalRecibido).toFixed(2)}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="border-border bg-muted/10 space-y-3 rounded-lg border p-3">
                                    <div className="text-muted-foreground pb-1 text-xs font-semibold">Distribución del Pago</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground w-20 text-xs font-medium">Efectivo:</span>
                                            <div className="relative flex-1">
                                                <span className="text-muted-foreground absolute top-1.5 left-2.5 text-xs">$</span>
                                                <Input
                                                    type="number"
                                                    size={1}
                                                    placeholder="0.00"
                                                    value={efectivo}
                                                    onChange={(e) => setEfectivo(e.target.value)}
                                                    className="h-7 bg-transparent pl-6 text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground w-20 text-xs font-medium">Tarjeta:</span>
                                            <div className="relative flex-1">
                                                <span className="text-muted-foreground absolute top-1.5 left-2.5 text-xs">$</span>
                                                <Input
                                                    type="number"
                                                    size={1}
                                                    placeholder="0.00"
                                                    value={tarjeta}
                                                    onChange={(e) => setTarjeta(e.target.value)}
                                                    className="h-7 bg-transparent pl-6 text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground w-20 text-xs font-medium">Transf.:</span>
                                            <div className="relative flex-1">
                                                <span className="text-muted-foreground absolute top-1.5 left-2.5 text-xs">$</span>
                                                <Input
                                                    type="number"
                                                    size={1}
                                                    placeholder="0.00"
                                                    value={transferencia}
                                                    onChange={(e) => setTransferencia(e.target.value)}
                                                    className="h-7 bg-transparent pl-6 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-border mt-2 flex justify-between border-t border-dashed pt-2 text-xs">
                                        <span className="text-muted-foreground font-medium">Total ingresado:</span>
                                        <span className="font-bold">${totalRecibido.toFixed(2)}</span>
                                    </div>
                                    {insuficiente && (
                                        <p className="mt-1 text-[10px] font-medium text-red-500">
                                            Faltan ${(pedido.total - totalRecibido).toFixed(2)} para completar el pago
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Calculated Change */}
                        <div className="border-border bg-muted/40 rounded-xl border p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground block text-xs font-semibold">Vueltas / Cambio</span>
                                    <span className="text-muted-foreground text-[10px]">Efectivo a devolver</span>
                                </div>
                                <span
                                    className={`text-2xl font-black tracking-tight ${insuficiente ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}
                                >
                                    ${cambio.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <DialogFooter className="mt-4 gap-2 border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmar}
                        disabled={loading || insuficiente || totalRecibido <= 0}
                        className="flex w-full items-center justify-center bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        {loading ? 'Procesando...' : 'Confirmar Pago'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Caja Tab ────────────────────────────────────────────────────────────────

interface CajaTabProps {
    caja: ReturnType<typeof useCaja>;
}

function CajaTab({ caja }: CajaTabProps) {
    const [showNuevaCaja, setShowNuevaCaja] = useState(false);
    const [nombreNueva, setNombreNueva] = useState('');
    const [creatingError, setCreatingError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    // Per-register modals
    const [abrirRegistro, setAbrirRegistro] = useState<CashRegister | null>(null);
    const [cerrarRegistro, setCerrarRegistro] = useState<CashRegister | null>(null);
    const [ingresoRegistro, setIngresoRegistro] = useState<CashRegister | null>(null);
    const [gastoRegistro, setGastoRegistro] = useState<CashRegister | null>(null);

    const handleCrearCaja = async () => {
        if (!nombreNueva.trim()) return;
        setCreating(true);
        setCreatingError(null);
        try {
            await caja.createRegistro(nombreNueva.trim());
            setNombreNueva('');
            setShowNuevaCaja(false);
        } catch {
            setCreatingError('Error al crear la caja');
        } finally {
            setCreating(false);
        }
    };

    if (caja.loading) {
        return (
            <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setShowNuevaCaja(true)} className="bg-emerald-600 text-white hover:bg-emerald-700" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Caja
                </Button>
            </div>

            {caja.registros.length === 0 ? (
                <EmptyState icon={<CreditCard />} title="Sin registros de caja" message="Crea tu primera caja para comenzar a operar" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {caja.registros.map((registro) => (
                        <RegistroCard
                            key={registro.id}
                            registro={registro}
                            resumen={caja.selectedRegistro?.id === registro.id ? caja.resumen : null}
                            onSelect={() => caja.selectRegistro(registro)}
                            onAbrir={() => setAbrirRegistro(registro)}
                            onCerrar={() => setCerrarRegistro(registro)}
                            onIngreso={() => {
                                caja.selectRegistro(registro);
                                setIngresoRegistro(registro);
                            }}
                            onGasto={() => {
                                caja.selectRegistro(registro);
                                setGastoRegistro(registro);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Nueva Caja Dialog */}
            <Dialog open={showNuevaCaja} onOpenChange={(o) => !o && setShowNuevaCaja(false)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Nueva Caja</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input
                            placeholder="Nombre de la caja (ej. Caja 1)"
                            value={nombreNueva}
                            onChange={(e) => setNombreNueva(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCrearCaja()}
                        />
                        {creatingError && <p className="text-sm text-red-600">{creatingError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNuevaCaja(false)} disabled={creating}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCrearCaja}
                            disabled={creating || !nombreNueva.trim()}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {creating ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Abrir Caja Dialog */}
            {abrirRegistro && (
                <AbrirCajaModal
                    registro={abrirRegistro}
                    onClose={() => setAbrirRegistro(null)}
                    onConfirm={async (monto) => {
                        caja.selectRegistro(abrirRegistro);
                        await caja.abrirCaja(monto);
                        setAbrirRegistro(null);
                    }}
                />
            )}

            {/* Cerrar Caja Dialog */}
            {cerrarRegistro && (
                <CerrarCajaModal
                    registro={cerrarRegistro}
                    resumen={caja.selectedRegistro?.id === cerrarRegistro.id ? caja.resumen : null}
                    onClose={() => setCerrarRegistro(null)}
                    onConfirm={async (montoReal, notas) => {
                        caja.selectRegistro(cerrarRegistro);
                        await caja.cerrarCaja(montoReal, notas);
                        setCerrarRegistro(null);
                    }}
                    onSelectRegistro={() => caja.selectRegistro(cerrarRegistro)}
                />
            )}

            {/* Ingreso Manual Dialog */}
            {ingresoRegistro && (
                <MovimientoModal
                    tipo="ingreso"
                    titulo="Ingreso Manual"
                    subtipos={[{ value: 'ingreso_manual', label: 'Ingreso manual' }]}
                    onClose={() => setIngresoRegistro(null)}
                    onConfirm={async (subtipo, monto, metodoPago, descripcion) => {
                        await caja.registrarMovimiento('ingreso', subtipo, monto, metodoPago, descripcion);
                        setIngresoRegistro(null);
                    }}
                />
            )}

            {/* Gasto Dialog */}
            {gastoRegistro && (
                <MovimientoModal
                    tipo="egreso"
                    titulo="Registrar Gasto"
                    subtipos={[
                        { value: 'gasto_operativo', label: 'Gasto operativo' },
                        { value: 'retiro_caja', label: 'Retiro de caja' },
                    ]}
                    onClose={() => setGastoRegistro(null)}
                    onConfirm={async (subtipo, monto, metodoPago, descripcion) => {
                        await caja.registrarMovimiento('egreso', subtipo, monto, metodoPago, descripcion);
                        setGastoRegistro(null);
                    }}
                />
            )}
        </div>
    );
}

// ─── Registro Card ───────────────────────────────────────────────────────────

interface RegistroCardProps {
    registro: CashRegister;
    resumen: CashSummary | null;
    onSelect: () => void;
    onAbrir: () => void;
    onCerrar: () => void;
    onIngreso: () => void;
    onGasto: () => void;
}

function RegistroCard({ registro, resumen, onSelect, onAbrir, onCerrar, onIngreso, onGasto }: RegistroCardProps) {
    const isOpen = registro.estado === 'abierta';

    return (
        <div
            className={`cursor-pointer rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                isOpen ? 'border-emerald-300 bg-emerald-50/10 dark:border-emerald-800/80 dark:bg-emerald-950/10' : 'border-border bg-card'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-foreground text-lg font-bold">{registro.nombre}</h3>
                    <span
                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isOpen ? 'text-emerald-850 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {isOpen ? '● Abierta' : '○ Cerrada'}
                    </span>
                </div>
                <CreditCard className={`h-6 w-6 ${isOpen ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
            </div>

            {/* Summary for open register */}
            {isOpen && resumen && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-background border-border rounded-lg border p-2">
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${resumen.saldo_actual?.toFixed(2) ?? '0.00'}</div>
                        <div className="text-muted-foreground text-[10px]">Saldo</div>
                    </div>
                    <div className="bg-background border-border rounded-lg border p-2">
                        <div className="text-green-650 text-sm font-bold dark:text-green-400">${resumen.total_ingresos?.toFixed(2) ?? '0.00'}</div>
                        <div className="text-muted-foreground text-[10px]">Ingresos</div>
                    </div>
                    <div className="bg-background border-border rounded-lg border p-2">
                        <div className="text-sm font-bold text-red-500 dark:text-red-400">${resumen.total_egresos?.toFixed(2) ?? '0.00'}</div>
                        <div className="text-muted-foreground text-[10px]">Egresos</div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {!isOpen && (
                    <Button
                        size="sm"
                        onClick={onAbrir}
                        className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        Abrir Caja
                    </Button>
                )}
                {isOpen && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onIngreso}
                            className="border-green-300 text-green-700 hover:bg-green-50/20 dark:border-green-800 dark:text-green-400"
                        >
                            <ArrowUpCircle className="mr-1 h-3.5 w-3.5" />
                            Ingreso
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onGasto}
                            className="border-red-300 text-red-500 hover:bg-red-50/20 dark:border-red-800 dark:text-red-400"
                        >
                            <ArrowDownCircle className="mr-1 h-3.5 w-3.5" />
                            Gasto
                        </Button>
                        <Button size="sm" variant="outline" onClick={onCerrar} className="text-foreground hover:bg-muted">
                            <Lock className="mr-1 h-3.5 w-3.5" />
                            Cerrar
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Abrir Caja Modal ────────────────────────────────────────────────────────

interface AbrirCajaModalProps {
    registro: CashRegister;
    onClose: () => void;
    onConfirm: (monto: number) => Promise<void>;
}

function AbrirCajaModal({ registro, onClose, onConfirm }: AbrirCajaModalProps) {
    const [monto, setMonto] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum < 0) {
            setError('Ingrese un monto inicial válido');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onConfirm(montoNum);
        } catch {
            setError('Error al abrir la caja');
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="border-border bg-card sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Abrir {registro.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <label className="text-foreground text-sm font-medium">Monto inicial en caja</label>
                    <div className="relative">
                        <span className="text-muted-foreground absolute top-2.5 left-3 text-sm font-medium">$</span>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                            className="pl-7"
                        />
                    </div>
                    {error && <p className="text-red-650 text-sm font-medium">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        {loading ? 'Abriendo...' : 'Abrir Caja'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Cerrar Caja Modal ───────────────────────────────────────────────────────

interface CerrarCajaModalProps {
    registro: CashRegister;
    resumen: CashSummary | null;
    onClose: () => void;
    onConfirm: (montoReal: number, notas?: string) => Promise<void>;
    onSelectRegistro: () => void;
}

function CerrarCajaModal({ registro, resumen, onClose, onConfirm, onSelectRegistro }: CerrarCajaModalProps) {
    const [montoReal, setMontoReal] = useState('');
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const montoNum = parseFloat(montoReal) || 0;
    const montoTeorico = resumen?.monto_teorico ?? null;
    const diferencia = montoTeorico !== null ? montoNum - montoTeorico : null;

    // Load summary on mount
    useEffect(() => {
        onSelectRegistro();
    }, [onSelectRegistro]);

    const handleConfirm = async () => {
        const num = parseFloat(montoReal);
        if (isNaN(num) || num < 0) {
            setError('Ingrese el monto contado');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onConfirm(num, notas.trim() || undefined);
        } catch {
            setError('Error al cerrar la caja');
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="border-border bg-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cerrar {registro.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {montoTeorico !== null && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-blue-300/30 bg-blue-500/10 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Monto Teórico</div>
                                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">${montoTeorico?.toFixed(2) ?? '0.00'}</div>
                                <div className="text-muted-foreground mt-0.5 text-[10px]">Calculado por sistema</div>
                            </div>
                            <div className="bg-muted/40 border-border rounded-lg border p-3 text-center">
                                <div className="text-muted-foreground text-xs font-medium">Conteo Físico</div>
                                <div className="text-foreground text-xl font-bold">{montoReal ? `$${montoNum.toFixed(2)}` : '—'}</div>
                                <div className="text-muted-foreground mt-0.5 text-[10px]">Ingresado por usted</div>
                            </div>
                        </div>
                    )}

                    {diferencia !== null && montoReal && (
                        <div
                            className={`rounded-lg border p-3 text-center ${
                                diferencia === 0
                                    ? 'border-emerald-350/20 bg-emerald-500/10 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                    : diferencia > 0
                                      ? 'border-blue-300/30 bg-blue-500/10 dark:border-blue-900/40 dark:bg-blue-950/20'
                                      : 'border-red-300/30 bg-red-500/10 dark:border-red-900/40 dark:bg-red-950/20'
                            }`}
                        >
                            <div className="text-muted-foreground text-xs font-medium">Diferencia</div>
                            <div
                                className={`text-lg font-bold ${
                                    diferencia === 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : diferencia > 0
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-red-500 dark:text-red-400'
                                }`}
                            >
                                {diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)}
                            </div>
                            <div className="text-muted-foreground text-[10px]">
                                {diferencia === 0 ? '¡Cuadra perfectamente!' : diferencia > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Monto contado (efectivo físico)</label>
                        <div className="relative">
                            <span className="text-muted-foreground absolute top-2.5 left-3 text-sm font-medium">$</span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={montoReal}
                                onChange={(e) => setMontoReal(e.target.value)}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Notas (opcional)</label>
                        <Input placeholder="Observaciones del cierre..." value={notas} onChange={(e) => setNotas(e.target.value)} />
                    </div>

                    {error && <p className="text-red-650 text-sm font-medium">{error}</p>}
                </div>
                <DialogFooter className="gap-2 border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading} variant="destructive" className="font-semibold">
                        {loading ? 'Cerrando...' : 'Confirmar Cierre'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Movimiento Modal ────────────────────────────────────────────────────────

interface MovimientoModalProps {
    tipo: 'ingreso' | 'egreso';
    titulo: string;
    subtipos: { value: string; label: string }[];
    onClose: () => void;
    onConfirm: (subtipo: string, monto: number, metodoPago: string, descripcion?: string) => Promise<void>;
}

function MovimientoModal({ titulo, subtipos, onClose, onConfirm }: MovimientoModalProps) {
    const [subtipo, setSubtipo] = useState(subtipos[0]?.value ?? '');
    const [monto, setMonto] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            setError('Ingrese un monto válido mayor a 0');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onConfirm(subtipo, montoNum, metodoPago, descripcion.trim() || undefined);
        } catch {
            setError('Error al registrar el movimiento');
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="border-border bg-card sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Tipo</label>
                        <Select value={subtipo} onValueChange={setSubtipo}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {subtipos.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Monto</label>
                        <div className="relative">
                            <span className="text-muted-foreground absolute top-2.5 left-3 text-sm font-medium">$</span>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Método de pago</label>
                        <Select value={metodoPago} onValueChange={setMetodoPago}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                <SelectItem value="transferencia">Transferencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">Descripción (opcional)</label>
                        <Input placeholder="Descripción..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                    </div>

                    {error && <p className="text-red-650 text-sm font-medium">{error}</p>}
                </div>
                <DialogFooter className="gap-2 border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Movimientos Tab ─────────────────────────────────────────────────────────

interface MovimientosTabProps {
    caja: ReturnType<typeof useCaja>;
}

function MovimientosTab({ caja }: MovimientosTabProps) {
    const formatFecha = (fecha: string) => {
        try {
            return new Date(fecha).toLocaleString('es', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return fecha;
        }
    };

    return (
        <div className="space-y-4">
            {/* Register selector */}
            <div className="flex items-center gap-3">
                <label className="text-foreground text-sm font-medium whitespace-nowrap">Ver registro:</label>
                <Select
                    value={caja.selectedRegistro?.id.toString() ?? ''}
                    onValueChange={(val) => {
                        const reg = caja.registros.find((r) => r.id === parseInt(val));
                        if (reg) caja.selectRegistro(reg);
                    }}
                >
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Seleccionar caja..." />
                    </SelectTrigger>
                    <SelectContent>
                        {caja.registros.map((r) => (
                            <SelectItem key={r.id} value={r.id.toString()}>
                                {r.nombre} — {r.estado === 'abierta' ? '● Abierta' : '○ Cerrada'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!caja.selectedRegistro ? (
                <EmptyState icon={<ArrowUpCircle />} title="Selecciona una caja" message="Elige un registro para ver sus movimientos" />
            ) : caja.movimientos.length === 0 ? (
                <EmptyState icon={<ArrowUpCircle />} title="Sin movimientos" message="Esta caja no tiene movimientos registrados" />
            ) : (
                <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 border-border border-b">
                                <tr>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-semibold">Fecha</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-semibold">Tipo</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-semibold">Subtipo</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-semibold">Método</th>
                                    <th className="text-muted-foreground px-4 py-3 text-right font-semibold">Monto</th>
                                    <th className="text-muted-foreground px-4 py-3 text-left font-semibold">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caja.movimientos.map((mov) => (
                                    <MovimientoRow key={mov.id} mov={mov} formatFecha={formatFecha} />
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/30 border-border border-t">
                                <tr>
                                    <td colSpan={4} className="text-muted-foreground px-4 py-3.5 text-right font-semibold">
                                        Total neto en caja:
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-bold">
                                        {(() => {
                                            const total = caja.movimientos.reduce((sum, m) => {
                                                const monto = typeof m.monto === 'string' ? parseFloat(m.monto) : m.monto;
                                                return sum + (m.tipo === 'ingreso' ? monto : -monto);
                                            }, 0);
                                            return (
                                                <span
                                                    className={
                                                        total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                                                    }
                                                >
                                                    {total >= 0 ? '+' : ''}${total.toFixed(2)}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function MovimientoRow({ mov, formatFecha }: { mov: CashMovement; formatFecha: (f: string) => string }) {
    const isIngreso = mov.tipo === 'ingreso';
    return (
        <tr className="border-border hover:bg-muted/20 border-b transition-colors">
            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">{formatFecha(mov.fecha ?? mov.created_at)}</td>
            <td className="px-4 py-3">
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isIngreso
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                    }`}
                >
                    {isIngreso ? '↑ Ingreso' : '↓ Egreso'}
                </span>
            </td>
            <td className="text-foreground px-4 py-3 capitalize">{mov.subtipo.replace(/_/g, ' ')}</td>
            <td className="text-muted-foreground px-4 py-3 capitalize">{mov.metodo_pago}</td>
            <td
                className={`px-4 py-3 text-right font-semibold ${isIngreso ? 'dark:text-emerald-450 text-emerald-600' : 'text-red-500 dark:text-red-400'}`}
            >
                {isIngreso ? '+' : '-'}${mov.monto.toFixed(2)}
            </td>
            <td className="text-muted-foreground max-w-[200px] truncate px-4 py-3" title={mov.descripcion ?? ''}>
                {mov.descripcion ?? '—'}
            </td>
        </tr>
    );
}

// ─── Pedido Card ─────────────────────────────────────────────────────────────

interface PedidoCajaCardProps {
    pedido: PedidoCaja;
    onMarcarPagado?: () => Promise<void>;
    onCerrarMesa?: () => Promise<void>;
    onCobrar?: () => void;
    readonly?: boolean;
}

function PedidoCajaCard({ pedido, onMarcarPagado, onCerrarMesa, onCobrar, readonly = false }: PedidoCajaCardProps) {
    const [isLoadingPagar, setIsLoadingPagar] = useState(false);
    const [isCerrandoMesa, setIsCerrandoMesa] = useState(false);

    const handleMarcarPagado = async () => {
        if (!onMarcarPagado) return;
        setIsLoadingPagar(true);
        try {
            await onMarcarPagado();
        } finally {
            setIsLoadingPagar(false);
        }
    };

    const handleCerrarMesa = async () => {
        if (!onCerrarMesa) return;
        setIsCerrandoMesa(true);
        try {
            await onCerrarMesa();
        } finally {
            setIsCerrandoMesa(false);
        }
    };

    return (
        <div className="border-border bg-card text-card-foreground hover:border-muted-foreground/35 rounded-xl border p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
                        <span className="text-muted-foreground font-semibold">{pedido.mesa_nombre}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <PagoBadge payment_status={pedido.payment_status} />
                        <EstadoBadge estado={pedido.estado as Parameters<typeof EstadoBadge>[0]['estado']} />
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${pedido.total.toFixed(2)}</div>
                    <div className="text-muted-foreground mt-1 flex items-center justify-end gap-1 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {pedido.tiempo_transcurrido} min
                    </div>
                </div>
            </div>

            <div className="border-border mt-4 flex flex-wrap gap-1.5 border-t border-dashed pt-3">
                {pedido.productos_resumen.map((p, idx) => (
                    <span key={`${p.nombre}-${idx}`} className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
                        {p.cantidad}× {p.nombre}
                    </span>
                ))}
            </div>

            {!readonly && (
                <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <Button
                        onClick={onCobrar}
                        className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        size="sm"
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Cobrar
                    </Button>
                    <Button onClick={handleMarcarPagado} disabled={isLoadingPagar} variant="outline" size="sm" className="hover:bg-muted font-medium">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isLoadingPagar ? 'Procesando...' : 'Pagar Rápido'}
                    </Button>
                    <Button onClick={handleCerrarMesa} disabled={isCerrandoMesa} variant="outline" size="sm" className="hover:bg-muted font-medium">
                        <X className="mr-2 h-4 w-4" />
                        {isCerrandoMesa ? 'Liberar Mesa...' : 'Cerrar Mesa'}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="border-border bg-card/50 rounded-xl border py-16 text-center shadow-sm">
            <div className="text-muted-foreground/35 mx-auto h-12 w-12 [&>svg]:mx-auto [&>svg]:h-full [&>svg]:w-full">{icon}</div>
            <h3 className="text-muted-foreground mt-4 text-base font-bold">{title}</h3>
            <p className="text-muted-foreground/75 mx-auto mt-1 max-w-xs text-sm">{message}</p>
        </div>
    );
}
