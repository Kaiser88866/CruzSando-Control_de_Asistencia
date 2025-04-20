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
        Schema::create('empleados', function (Blueprint $table) {
            $table->id(); // PK
            $table->string('nombre')->nullable();
            $table->string('tipo_pago')->nullable();
            $table->decimal('pago_unitario', 8, 2)->nullable();
            $table->string('tipo_empleado')->nullable();
            $table->string('codigo_huella')->nullable();
            $table->string('estado')->nullable(); // activo / inactivo
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
