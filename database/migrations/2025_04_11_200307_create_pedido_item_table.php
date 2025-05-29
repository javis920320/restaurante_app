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
        Schema::create('pedido_item', function (Blueprint $table) {
            $table->id();
           
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade'); // Relación con la tabla pedidos   
            $table->foreignId('plato_id')->constrained('platos')->onDelete('cascade'); // Relación con la tabla platos
            $table->integer('cantidad')->default(1); // Cantidad del plato en el pedido 
            $table->decimal('precio', 8, 2); // Precio del plato en el pedido   
            $table->decimal('total', 8, 2); // Total del plato en el pedido (cantidad * precio)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedido_item');
    }
};
