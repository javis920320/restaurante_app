import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PagoBadge from '@/components/Pedidos/PagoBadge';
import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import { useCajaKDS, type CajaData, type PedidoCaja } from '@/hooks/useCajaKDS';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Clock, RefreshCw, Wallet, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Caja', href: '/caja' },
];

interface Props {
    initialPedidos?: CajaData;
}

export default function Index({ initialPedidos }: Props) {
    const { data, loading, error, actionError, marcarComoPagado, cerrarMesa, refetch } = useCajaKDS({
        pollingInterval: 15,
        initialData: initialPedidos,
    });

    const [tab, setTab] = useState<'pending' | 'paid'>('pending');

    const pendingCount = data.pending.length;
    const paidCount = data.paid.length;
    const pendingTotal = data.pending.reduce((sum, p) => sum + p.total, 0);

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
                    <Button onClick={refetch} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                    </Button>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {actionError && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-yellow-700">{actionError}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setTab('pending')}
                        className={`flex items-center gap-2 border-b-2 px-4 pb-2 text-sm font-medium transition-colors ${
                            tab === 'pending'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Wallet className="h-4 w-4" />
                        Pendientes de Pago
                        {pendingCount > 0 && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('paid')}
                        className={`flex items-center gap-2 border-b-2 px-4 pb-2 text-sm font-medium transition-colors ${
                            tab === 'paid'
                                ? 'border-emerald-600 text-emerald-600'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Pagados
                        {paidCount > 0 && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                                {paidCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                {loading && data.pending.length === 0 && data.paid.length === 0 ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tab === 'pending' && (
                            <>
                                {data.pending.length === 0 ? (
                                    <div className="rounded-xl border py-16 text-center">
                                        <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-3 text-lg font-semibold text-gray-500">¡Sin pendientes!</h3>
                                        <p className="text-gray-400">Todos los pedidos han sido cobrados</p>
                                    </div>
                                ) : (
                                    data.pending.map((pedido) => (
                                        <PedidoCajaCard
                                            key={pedido.id}
                                            pedido={pedido}
                                            onMarcarPagado={() => marcarComoPagado(pedido.id)}
                                            onCerrarMesa={() => cerrarMesa(pedido.id)}
                                        />
                                    ))
                                )}
                            </>
                        )}

                        {tab === 'paid' && (
                            <>
                                {data.paid.length === 0 ? (
                                    <div className="rounded-xl border py-16 text-center">
                                        <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-3 text-lg font-semibold text-gray-500">Sin cobros registrados</h3>
                                        <p className="text-gray-400">Los pedidos pagados aparecerán aquí</p>
                                    </div>
                                ) : (
                                    data.paid.map((pedido) => (
                                        <PedidoCajaCard
                                            key={pedido.id}
                                            pedido={pedido}
                                            readonly
                                        />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

interface PedidoCajaCardProps {
    pedido: PedidoCaja;
    onMarcarPagado?: () => Promise<void>;
    onCerrarMesa?: () => Promise<void>;
    readonly?: boolean;
}

function PedidoCajaCard({ pedido, onMarcarPagado, onCerrarMesa, readonly = false }: PedidoCajaCardProps) {
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
            {/* Card header */}
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

                {/* Time + Total */}
                <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">${pedido.total.toFixed(2)}</div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {pedido.tiempo_transcurrido} min
                    </div>
                </div>
            </div>

            {/* Products summary */}
            <div className="mt-3 flex flex-wrap gap-2">
                {pedido.productos_resumen.map((p, idx) => (
                    <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                        {p.cantidad}× {p.nombre}
                    </span>
                ))}
            </div>

            {/* Actions */}
            {!readonly && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        onClick={handleMarcarPagado}
                        disabled={isLoadingPagar}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {isLoadingPagar ? 'Procesando...' : 'Marcar como Pagado'}
                    </Button>
                    <Button
                        onClick={handleCerrarMesa}
                        disabled={isCerrandoMesa}
                        variant="outline"
                        size="sm"
                    >
                        <X className="mr-2 h-4 w-4" />
                        {isCerrandoMesa ? 'Cerrando...' : 'Pagar y Cerrar Mesa'}
                    </Button>
                </div>
            )}
        </div>
    );
}
