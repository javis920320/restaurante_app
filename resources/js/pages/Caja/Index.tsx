import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import { useCaja } from '@/hooks/useCaja';
import { useCajaKDS, type CajaData, type PedidoCaja } from '@/hooks/useCajaKDS';
import AppLayout from '@/layouts/app-layout';
import cajaService, { CashMovement, CashRegister, CashSummary } from '@/services/cajaService';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Lock,
    Plus,
    RefreshCw,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

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
                            <h1 className="text-3xl font-bold">Panel de Caja</h1>
                            <p className="text-muted-foreground">
                                {pendingCount} pedido(s) pendientes de pago • ${pendingTotal.toFixed(2)} por cobrar
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleRefreshAll} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                {(kds.error || caja.error) && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700">{kds.error ?? caja.error}</p>
                    </div>
                )}

                {kds.actionError && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-yellow-700">{kds.actionError}</p>
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
                        activeRegistroId={
                            caja.registros.find((r) => r.estado === 'abierta')?.id ?? null
                        }
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
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 border-b-2 px-4 pb-2 text-sm font-medium transition-colors ${
                active
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
            {badge !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
                    {badge}
                </span>
            )}
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
                                kds.data.paid.map((pedido) => (
                                    <PedidoCajaCard key={pedido.id} pedido={pedido} readonly />
                                ))
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

    const montoNum = parseFloat(montoPagado) || 0;
    const cambio = Math.max(0, montoNum - pedido.total);
    const insuficiente = montoNum > 0 && montoNum < pedido.total;

    const handleConfirmar = async () => {
        if (montoNum <= 0) {
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
            await cajaService.registrarPago({
                pedido_id: pedido.id,
                monto_pagado: montoNum,
                metodo_pago: metodoPago,
                ...(activeRegistroId ? { cash_register_id: activeRegistroId } : {}),
            });
            onSuccess();
        } catch {
            setError('Error al registrar el pago. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cobrar Pedido #{pedido.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order info */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Mesa</span>
                            <span className="font-medium">{pedido.mesa_nombre}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-sm text-gray-600">Total a cobrar</span>
                            <span className="text-xl font-bold text-emerald-600">
                                ${pedido.total.toFixed(2)}
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {pedido.productos_resumen.map((p, i) => (
                                <span key={`${p.nombre}-${i}`} className="rounded-full bg-white border px-2 py-0.5 text-xs text-gray-600">
                                    {p.cantidad}× {p.nombre}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Método de pago</label>
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

                    {/* Monto recibido */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Monto recibido</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={`Mínimo $${pedido.total.toFixed(2)}`}
                            value={montoPagado}
                            onChange={(e) => setMontoPagado(e.target.value)}
                            className={insuficiente ? 'border-red-400 focus-visible:ring-red-400' : ''}
                        />
                        {insuficiente && (
                            <p className="text-xs text-red-500">
                                Faltan ${(pedido.total - montoNum).toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Cambio */}
                    <div className="rounded-lg border bg-emerald-50 p-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Cambio</span>
                            <span className={`text-lg font-bold ${insuficiente ? 'text-red-500' : 'text-emerald-600'}`}>
                                ${cambio.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmar}
                        disabled={loading || insuficiente}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <Button
                    onClick={() => setShowNuevaCaja(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Caja
                </Button>
            </div>

            {caja.registros.length === 0 ? (
                <EmptyState
                    icon={<CreditCard />}
                    title="Sin registros de caja"
                    message="Crea tu primera caja para comenzar a operar"
                />
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
            className={`rounded-xl border p-5 transition-all ${
                isOpen ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold">{registro.nombre}</h3>
                    <span
                        className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isOpen
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {isOpen ? '● Abierta' : '○ Cerrada'}
                    </span>
                </div>
                <CreditCard className={`h-6 w-6 ${isOpen ? 'text-emerald-500' : 'text-gray-300'}`} />
            </div>

            {/* Summary for open register */}
            {isOpen && resumen && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-white border p-2">
                        <div className="font-bold text-emerald-600 text-sm">${resumen.saldo_actual.toFixed(2)}</div>
                        <div className="text-gray-500">Saldo</div>
                    </div>
                    <div className="rounded-lg bg-white border p-2">
                        <div className="font-bold text-green-600 text-sm">${resumen.total_ingresos.toFixed(2)}</div>
                        <div className="text-gray-500">Ingresos</div>
                    </div>
                    <div className="rounded-lg bg-white border p-2">
                        <div className="font-bold text-red-500 text-sm">${resumen.total_egresos.toFixed(2)}</div>
                        <div className="text-gray-500">Egresos</div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {!isOpen && (
                    <Button size="sm" onClick={onAbrir} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Abrir Caja
                    </Button>
                )}
                {isOpen && (
                    <>
                        <Button size="sm" variant="outline" onClick={onIngreso} className="text-green-700 border-green-300 hover:bg-green-50">
                            <ArrowUpCircle className="mr-1 h-3.5 w-3.5" />
                            Ingreso
                        </Button>
                        <Button size="sm" variant="outline" onClick={onGasto} className="text-red-600 border-red-300 hover:bg-red-50">
                            <ArrowDownCircle className="mr-1 h-3.5 w-3.5" />
                            Gasto
                        </Button>
                        <Button size="sm" variant="outline" onClick={onCerrar} className="text-gray-700">
                            <Lock className="mr-1 h-3.5 w-3.5" />
                            Cerrar Caja
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
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Abrir {registro.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <label className="text-sm font-medium">Monto inicial en caja</label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
    useState(() => {
        onSelectRegistro();
    });

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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cerrar {registro.nombre}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {montoTeorico !== null && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                                <div className="text-xs text-blue-600 font-medium">Monto Teórico</div>
                                <div className="text-xl font-bold text-blue-700">${montoTeorico.toFixed(2)}</div>
                                <div className="text-xs text-blue-400">Calculado por sistema</div>
                            </div>
                            <div className="rounded-lg bg-gray-50 border p-3 text-center">
                                <div className="text-xs text-gray-600 font-medium">Conteo Físico</div>
                                <div className="text-xl font-bold text-gray-700">
                                    {montoReal ? `$${montoNum.toFixed(2)}` : '—'}
                                </div>
                                <div className="text-xs text-gray-400">Ingresado por usted</div>
                            </div>
                        </div>
                    )}

                    {diferencia !== null && montoReal && (
                        <div
                            className={`rounded-lg p-3 text-center border ${
                                diferencia === 0
                                    ? 'bg-green-50 border-green-200'
                                    : diferencia > 0
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <div className="text-xs font-medium text-gray-600">Diferencia</div>
                            <div
                                className={`text-lg font-bold ${
                                    diferencia === 0
                                        ? 'text-green-600'
                                        : diferencia > 0
                                        ? 'text-blue-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                                {diferencia === 0 ? '¡Cuadra perfectamente!' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Monto contado (efectivo físico)</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={montoReal}
                            onChange={(e) => setMontoReal(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Notas (opcional)</label>
                        <Input
                            placeholder="Observaciones del cierre..."
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        variant="destructive"
                    >
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
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Tipo</label>
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

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Monto</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Método de pago</label>
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

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Descripción (opcional)</label>
                        <Input
                            placeholder="Descripción..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <label className="text-sm font-medium whitespace-nowrap">Ver registro:</label>
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
                <EmptyState
                    icon={<ArrowUpCircle />}
                    title="Selecciona una caja"
                    message="Elige un registro para ver sus movimientos"
                />
            ) : caja.movimientos.length === 0 ? (
                <EmptyState
                    icon={<ArrowUpCircle />}
                    title="Sin movimientos"
                    message="Esta caja no tiene movimientos registrados"
                />
            ) : (
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Subtipo</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Método</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600">Monto</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {caja.movimientos.map((mov) => (
                                <MovimientoRow key={mov.id} mov={mov} formatFecha={formatFecha} />
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 font-semibold text-right text-gray-600">
                                    Total neto:
                                </td>
                                <td className="px-4 py-3 text-right font-bold">
                                    {(() => {
                                        const total = caja.movimientos.reduce(
                                            (sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto),
                                            0,
                                        );
                                        return (
                                            <span className={total >= 0 ? 'text-emerald-600' : 'text-red-600'}>
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
            )}
        </div>
    );
}

function MovimientoRow({ mov, formatFecha }: { mov: CashMovement; formatFecha: (f: string) => string }) {
    const isIngreso = mov.tipo === 'ingreso';
    return (
        <tr className="border-b hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatFecha(mov.fecha ?? mov.created_at)}</td>
            <td className="px-4 py-3">
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isIngreso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                    }`}
                >
                    {isIngreso ? '↑ Ingreso' : '↓ Egreso'}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-700">{mov.subtipo.replace(/_/g, ' ')}</td>
            <td className="px-4 py-3 text-gray-600 capitalize">{mov.metodo_pago}</td>
            <td className={`px-4 py-3 text-right font-semibold ${isIngreso ? 'text-green-700' : 'text-red-600'}`}>
                {isIngreso ? '+' : '-'}${mov.monto.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{mov.descripcion ?? '—'}</td>
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

function PedidoCajaCard({
    pedido,
    onMarcarPagado,
    onCerrarMesa,
    onCobrar,
    readonly = false,
}: PedidoCajaCardProps) {
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
        <div className="rounded-xl border p-5 transition-all hover:border-gray-300">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">Pedido #{pedido.id}</h3>
                        <span className="text-muted-foreground font-medium">{pedido.mesa_nombre}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                        <PagoBadge payment_status={pedido.payment_status} />
                        <EstadoBadge estado={pedido.estado as Parameters<typeof EstadoBadge>[0]['estado']} />
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">${pedido.total.toFixed(2)}</div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {pedido.tiempo_transcurrido} min
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {pedido.productos_resumen.map((p, idx) => (
                    <span key={`${p.nombre}-${idx}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {p.cantidad}× {p.nombre}
                    </span>
                ))}
            </div>

            {!readonly && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        onClick={onCobrar}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Cobrar
                    </Button>
                    <Button
                        onClick={handleMarcarPagado}
                        disabled={isLoadingPagar}
                        variant="outline"
                        size="sm"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isLoadingPagar ? 'Procesando...' : 'Marcar Pagado'}
                    </Button>
                    <Button
                        onClick={handleCerrarMesa}
                        disabled={isCerrandoMesa}
                        variant="outline"
                        size="sm"
                    >
                        <X className="mr-2 h-4 w-4" />
                        {isCerrandoMesa ? 'Cerrando...' : 'Cerrar Mesa'}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="rounded-xl border py-16 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300 [&>svg]:mx-auto [&>svg]:h-full [&>svg]:w-full">
                {icon}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-gray-500">{title}</h3>
            <p className="text-gray-400">{message}</p>
        </div>
    );
}
