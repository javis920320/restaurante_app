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
        Schema::create('historial_estados_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->string('estado_anterior')->nullable();
            $table->string('estado_nuevo');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('canal')->nullable(); // qr, mesero, system
            $table->text('notas')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('pedido_id');
            $table->index(['pedido_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_estados_pedido');
    }
};
