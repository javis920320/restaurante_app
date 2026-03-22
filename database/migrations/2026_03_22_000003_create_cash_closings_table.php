<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_closings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_opening_id')->constrained('cash_openings')->cascadeOnDelete();
            $table->decimal('monto_teorico', 10, 2);
            $table->decimal('monto_real', 10, 2);
            $table->decimal('diferencia', 10, 2);
            $table->timestamp('fecha_cierre');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_closings');
    }
};
