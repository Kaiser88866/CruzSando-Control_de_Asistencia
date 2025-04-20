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
            $table->id(); // PK
            $table->foreignId('id_empleado')->constrained('empleados')->onDelete('cascade');
            $table->date('periodo_inicio')->nullable();
            $table->date('periodo_fin')->nullable();
            $table->string('tipo_pago')->nullable();
            $table->decimal('total_pagado', 10, 2)->nullable();
            $table->timestamp('generado_en')->nullable();
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
