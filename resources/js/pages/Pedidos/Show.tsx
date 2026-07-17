import EstadoBadge from '@/components/Pedidos/EstadoBadge';
import EstadoSelector from '@/components/Pedidos/EstadoSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminPedidos } from '@/hooks/useAdminPedidos';
import AppLayout from '@/layouts/app-layout';
import { HistorialEstado, Pedido } from '@/services/pedidoService';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    Calendar,
    CheckCircle,
    CheckCircle2,
    ChefHat,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    MessageSquare,
    QrCode,
    Truck,
    User,
    UserCheck,
    Utensils,
} from 'lucide-react';

interface ShowProps {
    pedido: Pedido;
}

const ESTADOS_LABELS: Record<string, string> = {
    pendiente: 'Creado',
    confirmado: 'Confirmado',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    pagado: 'Facturado / Cerrado',
    cancelado: 'Cancelado',
};

const ESTADOS_COLORS: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/30',
    confirmado: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
    en_preparacion: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-450 dark:border-orange-900/30',
    listo: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30',
    entregado: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30',
    pagado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    cancelado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
};

function HistorialTimeline({ historial }: { historial: HistorialEstado[] }) {
    if (!historial || historial.length === 0) return null;

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                <Clock className="text-blue-655 h-5 w-5" />
                Historial de Estados
            </h2>
            <ol className="relative ml-2 space-y-4 border-l border-zinc-200 dark:border-zinc-800">
                {historial.map((entrada) => (
                    <li key={entrada.id} className="relative ml-5">
                        <div className="absolute -left-[26px] mt-1 h-3 w-3 rounded-full border-2 border-white bg-zinc-400 dark:border-zinc-900" />
                        <div
                            className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${ESTADOS_COLORS[entrada.estado_nuevo] ?? 'border-zinc-200 bg-zinc-100 text-zinc-800'}`}
                        >
                            {ESTADOS_LABELS[entrada.estado_nuevo] ?? entrada.estado_nuevo}
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{formatDateTime(entrada.created_at)}</p>
                        {entrada.user && (
                            <p className="text-zinc-655 mt-0.5 text-xs dark:text-zinc-400">
                                Por: <span className="font-semibold">{entrada.user.name}</span>
                                {entrada.canal && (
                                    <span className="ml-1 font-medium text-zinc-400 dark:text-zinc-600">
                                        (
                                        {entrada.canal === 'qr' ? (
                                            <>
                                                <QrCode className="mr-0.5 inline h-3 w-3" />
                                                QR
                                            </>
                                        ) : (
                                            <>
                                                <Utensils className="mr-0.5 inline h-3 w-3" />
                                                Mesero
                                            </>
                                        )}
                                        )
                                    </span>
                                )}
                            </p>
                        )}
                        {!entrada.user && entrada.canal === 'qr' && (
                            <p className="mt-0.5 text-xs font-medium text-zinc-500">
                                <QrCode className="mr-0.5 inline h-3 w-3" />
                                Pedido por QR
                            </p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function Show({ pedido: pedidoInicial }: ShowProps) {
    const { cambiarEstado } = useAdminPedidos();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCambiarEstado = async (pedidoId: number, nuevoEstado: string) => {
        await cambiarEstado(pedidoId, nuevoEstado);
        window.location.reload();
    };

    const puedeEditarEstado = !['pagado', 'cancelado'].includes(pedidoInicial.estado);

    // Obtener la hora del historial para cada estado
    const getStepTime = (stepValue: string) => {
        const entry = pedidoInicial.historial?.find((h) => h.estado_nuevo === stepValue);
        if (!entry) return null;
        return new Date(entry.created_at).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Pasos del Stepper
    const STEPPER_STEPS = [
        { value: 'pendiente', label: 'Creado', icon: FileText },
        { value: 'confirmado', label: 'Confirmado', icon: CheckCircle2 },
        { value: 'en_preparacion', label: 'En Cocina', icon: ChefHat },
        { value: 'listo', label: 'Listo', icon: Bell },
        { value: 'entregado', label: 'Entregado', icon: Truck },
    ];

    const currentStepIndex = STEPPER_STEPS.findIndex((s) => s.value === pedidoInicial.estado);
    const isCanceled = pedidoInicial.estado === 'cancelado';
    const isPaidHistorical = pedidoInicial.estado === 'pagado';

    // Si ya está facturado/cerrado en estado operativo histórico, marcar todos como completados
    const activeStepIndex = isPaidHistorical ? STEPPER_STEPS.length - 1 : currentStepIndex;

    return (
        <AppLayout>
            <Head title={`Pedido #${pedidoInicial.id}`} />

            <div className="space-y-6">
                {/* Header Premium */}
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-5 md:flex-row md:items-center dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="dark:border-zinc-850 h-9 rounded-lg border-zinc-200 px-3">
                            <Link href="/pedidos">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                                    Pedido #{pedidoInicial.id}
                                </h1>
                                {pedidoInicial.canal && (
                                    <Badge
                                        variant="outline"
                                        className="gap-1 rounded-full border-zinc-200 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400"
                                    >
                                        {pedidoInicial.canal === 'qr' ? (
                                            <>
                                                <QrCode className="h-3 w-3" /> QR
                                            </>
                                        ) : (
                                            <>
                                                <Utensils className="h-3 w-3" /> Mesero
                                            </>
                                        )}
                                    </Badge>
                                )}
                            </div>
                            <p className="dark:text-zinc-550 mt-1 text-xs font-medium text-zinc-400">
                                Registrado el {formatDate(pedidoInicial.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Estados contiguos (Eje Operativo + Eje Financiero) */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        <EstadoBadge estado={pedidoInicial.estado} />
                        {/*    {pedidoInicial.payment_status && (
                            <PagoBadge payment_status={pedidoInicial.payment_status} />
                        )} */}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel Izquierdo: Stepper y Productos */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Stepper de Progreso o Banner de Cancelado */}
                        {isCanceled ? (
                            <div className="flex items-start gap-3.5 rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-950/20 dark:bg-red-950/15">
                                <div className="bg-red-650 rounded-xl p-3 text-white shadow-xs">
                                    <AlertCircle className="h-6 w-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-red-900 dark:text-red-400">Pedido Cancelado</h3>
                                    <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-300">
                                        Esta orden fue dada de baja del sistema. Para ver más detalles, por favor revisa el historial de estados al
                                        pie de la página.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="dark:border-zinc-850 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:bg-zinc-900">
                                <h3 className="mb-4 flex items-center gap-1.5 text-xs font-extrabold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                                    <CheckCircle className="h-4 w-4" />
                                    Progreso de la Orden
                                </h3>
                                {/* Stepper Progress Bar */}
                                <div className="relative mt-2 flex w-full items-center justify-between px-1.5 sm:px-6">
                                    {/* Línea de fondo */}
                                    <div className="absolute top-[18px] left-[32px] z-0 h-1 bg-zinc-100 sm:right-[54px] sm:left-[54px] dark:bg-zinc-800" />
                                    {/* Línea activa */}
                                    <div
                                        className="absolute top-[18px] left-[32px] z-0 h-1 bg-blue-600 transition-all duration-500 sm:left-[54px] dark:bg-blue-500"
                                        style={{
                                            width:
                                                activeStepIndex >= 0
                                                    ? `calc(${(activeStepIndex / (STEPPER_STEPS.length - 1)) * 100}% - ${activeStepIndex === STEPPER_STEPS.length - 1 ? '16px' : '0px'})`
                                                    : '0%',
                                        }}
                                    />

                                    {/* Círculos de Pasos */}
                                    {STEPPER_STEPS.map((step, idx) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = activeStepIndex > idx || (isPaidHistorical && idx === STEPPER_STEPS.length - 1);
                                        const isActive = activeStepIndex === idx;
                                        const stepTime = getStepTime(step.value);

                                        return (
                                            <div
                                                key={step.value}
                                                className="group relative z-10 flex min-w-[50px] flex-col items-center text-center sm:min-w-[70px]"
                                            >
                                                {/* Círculo */}
                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10 ${
                                                        isCompleted
                                                            ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                                                            : isActive
                                                              ? 'animate-pulse-slow border-blue-600 bg-white font-black text-blue-600 ring-4 ring-blue-500/10 dark:border-blue-500 dark:bg-zinc-900 dark:text-blue-400 dark:ring-blue-500/20'
                                                              : 'dark:text-zinc-650 border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950'
                                                    }`}
                                                >
                                                    <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                {/* Etiqueta */}
                                                <span
                                                    className={`mt-2 text-[10px] font-bold tracking-tight sm:text-xs ${
                                                        isCompleted || isActive
                                                            ? 'text-zinc-850 font-extrabold dark:text-zinc-200'
                                                            : 'text-zinc-400 dark:text-zinc-600'
                                                    }`}
                                                >
                                                    {step.label}
                                                </span>
                                                {/* Hora del estado */}
                                                {stepTime ? (
                                                    <span className="py-0.2 mt-1 rounded-md bg-emerald-50 px-1.5 text-[9px] font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500">
                                                        {stepTime}
                                                    </span>
                                                ) : (
                                                    <span className="mt-1 text-[9px] text-transparent select-none">-</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Listado de Platos */}
                        <div className="dark:border-zinc-850 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:bg-zinc-900">
                            <h2 className="mb-4 flex items-center gap-2 border-b pb-3 text-base font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
                                <Utensils className="text-blue-655 h-5 w-5" />
                                Detalle de Consumo
                            </h2>

                            {pedidoInicial.detalles && pedidoInicial.detalles.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {pedidoInicial.detalles.map((detalle) => (
                                            <div
                                                key={detalle.id}
                                                className="flex items-center gap-4 rounded-xl px-2 py-4 transition-all duration-150 first:pt-0 last:pb-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20"
                                            >
                                                {/* Cantidad */}
                                                <div className="text-blue-750 dark:bg-blue-955/40 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100/50 bg-blue-50 text-sm font-black dark:border-blue-900/10 dark:text-blue-400">
                                                    x{detalle.cantidad}
                                                </div>

                                                {/* Información Plato */}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-zinc-850 dark:text-zinc-250 truncate text-sm font-bold sm:text-base">
                                                        {detalle.producto.nombre}
                                                    </h3>
                                                    <p className="dark:text-zinc-450 mt-0.5 text-xs font-medium text-zinc-500">
                                                        Precio unitario: {formatPrice(detalle.precio_unitario)}
                                                    </p>
                                                    {/* Notas específicas del plato */}
                                                    {detalle.notas && (
                                                        <div className="mt-2 inline-flex items-start gap-1.5 rounded-lg border border-amber-100/50 bg-amber-50/70 px-2.5 py-1 text-xs leading-normal text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/25 dark:text-amber-300">
                                                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                                                            <span className="font-semibold italic">Nota: {detalle.notas}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subtotal Item */}
                                                <div className="shrink-0 text-right">
                                                    <span className="text-sm font-black text-zinc-900 sm:text-base dark:text-white">
                                                        {formatPrice(detalle.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Caja de Totales Premium */}
                                    <div className="mt-4 space-y-3 rounded-xl border-t bg-zinc-50/40 p-4 pt-4 dark:border-zinc-800 dark:bg-zinc-950/10">
                                        <div className="text-zinc-550 flex justify-between text-xs font-medium sm:text-sm dark:text-zinc-400">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(pedidoInicial.subtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-3 dark:border-zinc-800">
                                            <span className="text-zinc-850 flex items-center gap-1.5 text-sm font-bold sm:text-base dark:text-zinc-200">
                                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                                Total Facturado
                                            </span>
                                            <span className="text-xl font-black text-emerald-600 sm:text-2xl dark:text-emerald-400">
                                                {formatPrice(pedidoInicial.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="dark:text-zinc-650 rounded-xl border border-dashed py-8 text-center text-zinc-400">
                                    <Utensils className="mx-auto mb-2 h-10 w-10 stroke-[1.5] opacity-50" />
                                    <p className="text-sm font-medium">No hay productos registrados en esta orden</p>
                                </div>
                            )}
                        </div>

                        {/* Notas del pedido generales */}
                        {pedidoInicial.notas && (
                            <div className="dark:border-zinc-850 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:bg-zinc-900">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="mb-1 text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                                            Notas Generales del Pedido
                                        </h2>
                                        <p className="text-zinc-655 mt-1 text-sm leading-relaxed font-medium dark:text-zinc-400">
                                            {pedidoInicial.notas}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Historial de estados (Timeline) */}
                        {pedidoInicial.historial && pedidoInicial.historial.length > 0 && <HistorialTimeline historial={pedidoInicial.historial} />}
                    </div>

                    {/* Panel Derecho: Cambiar Estado y Metadatos */}
                    <div className="space-y-6">
                        {/* Cambiar estado */}
                        {puedeEditarEstado && (
                            <div className="dark:border-zinc-850 space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:bg-zinc-900">
                                <h2 className="flex items-center gap-1.5 text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                    Cambiar Estado Operativo
                                </h2>
                                <EstadoSelector
                                    estadoActual={pedidoInicial.estado}
                                    pedidoId={pedidoInicial.id}
                                    onCambiarEstado={handleCambiarEstado}
                                />
                            </div>
                        )}

                        {/* Información del pedido (Metadatos) */}
                        <div className="dark:border-zinc-850 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:bg-zinc-900">
                            <h2 className="mb-4 flex items-center gap-1.5 border-b pb-3 text-sm font-bold tracking-wider text-zinc-900 uppercase dark:border-zinc-800 dark:text-white">
                                <FileText className="text-blue-655 h-4.5 w-4.5" />
                                Información de Servicio
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-zinc-650 shrink-0 rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800 dark:text-zinc-400">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">Mesa</p>
                                        <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                                            {pedidoInicial.mesa?.nombre || `Mesa #${pedidoInicial.mesa_id}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-zinc-650 shrink-0 rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800 dark:text-zinc-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                                            Fecha y hora de Registro
                                        </p>
                                        <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                                            {formatDate(pedidoInicial.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {pedidoInicial.user && (
                                    <div className="flex items-center gap-3">
                                        <div className="text-zinc-650 shrink-0 rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800 dark:text-zinc-400">
                                            <UserCheck className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                                                Atendido por
                                            </p>
                                            <p className="truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                                                {pedidoInicial.user.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {pedidoInicial.cliente && (
                                    <div className="flex items-center gap-3">
                                        <div className="text-zinc-655 shrink-0 rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800 dark:text-zinc-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                                                Cliente de la Mesa
                                            </p>
                                            <p className="text-zinc-850 truncate text-sm font-extrabold dark:text-zinc-200">
                                                {pedidoInicial.cliente}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
