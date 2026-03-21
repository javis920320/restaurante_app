<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Migrates existing orders with estado='pagado' to the new dual-state model:
     *   - payment_status = 'paid'
     *   - estado = 'entregado' (last valid operational state)
     */
    public function up(): void
    {
        DB::table('pedidos')
            ->where('estado', 'pagado')
            ->update([
                'payment_status' => 'paid',
                'estado' => 'entregado',
            ]);
    }

    /**
     * Reverse the migrations.
     *
     * Restores orders that were migrated back to estado='pagado'.
     * Note: this is a best-effort rollback; the original estado cannot
     * be recovered if it was already 'pagado'.
     */
    public function down(): void
    {
        DB::table('pedidos')
            ->where('payment_status', 'paid')
            ->where('estado', 'entregado')
            ->update([
                'estado' => 'pagado',
                'payment_status' => 'pending',
            ]);
    }
};
