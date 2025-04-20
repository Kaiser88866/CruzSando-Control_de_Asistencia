<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDatosTrasladoTable extends Migration
{
    public function up()
    {
        Schema::create('datos_traslado', function (Blueprint $table) {
            $table->id();
            $table->string('dueno')->default('CANDIDO CRUZ SANDOVAL');
            $table->string('empresa_transportista');
            $table->string('lugar_entrega');
            $table->string('clave_producto_sat');
            $table->foreignId('envio_id')->constrained('envios')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('datos_traslado');
    }
}
