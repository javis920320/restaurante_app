<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained('cash_registers')->cascadeOnDelete();
            $table->foreignId('cash_opening_id')->nullable()->constrained('cash_openings')->nullOnDelete();
            $table->enum('tipo', ['ingreso', 'egreso']);
            $table->enum('subtipo', ['venta', 'cambio_entregado', 'gasto_operativo', 'retiro_caja', 'ingreso_manual', 'correccion']);
            $table->decimal('monto', 10, 2);
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia'])->default('efectivo');
            $table->unsignedInteger('referencia_id')->nullable();
            $table->string('descripcion')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
