<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmpleadosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('empleados')->insert([
            [
                'nombre' => 'Karen Ramírez',
                'tipo_pago' => 'por hora',
                'pago_unitario' => 80,
                'tipo_empleado' => 'costurera',
                'codigo_huella' => 'K01',
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Carlos Pérez',
                'tipo_pago' => 'por día',
                'pago_unitario' => 500,
                'tipo_empleado' => 'operador',
                'codigo_huella' => 'C01',
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Ana Torres',
                'tipo_pago' => 'por pieza',
                'pago_unitario' => 15,
                'tipo_empleado' => 'planchado',
                'codigo_huella' => 'A01',
                'estado' => 'inactivo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
