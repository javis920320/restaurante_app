<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pedido_id')->unique();
            $table->foreign('pedido_id')->references('id')->on('pedidos')->onDelete('cascade');
            $table->string('metodo_pago'); // Método de pago (efectivo, tarjeta, etc.)
            $table->string('estado')->default('pendiente'); // Estado del pago (pendiente, completado, fallido)
            $table->decimal('monto', 10, 2); 
            $table->string('referencia')->nullable(); // Referencia del pago (opcional)

            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
