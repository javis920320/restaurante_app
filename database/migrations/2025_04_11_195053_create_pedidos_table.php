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
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade'); // Relación con la tabla clientes    
            $table->foreignId("user_id")->constrained("users")->onDelete("cascade"); // Relación con la tabla users
            $table->foreignId("mesa_id")->constrained("mesas")->onDelete("cascade"); // Relación con la tabla mesas 
            $table->enum('estado', ['pendiente', 'en_cocina', 'servido', 'pagado']); // Estado del pedido
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
