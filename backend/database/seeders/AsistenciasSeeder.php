<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AsistenciasSeeder extends Seeder
{
    public function run(): void
    {
        $inicioSemana = Carbon::now()->startOfWeek(); // lunes
        $empleados = DB::table('empleados')->pluck('id');

        foreach ($empleados as $idEmpleado) {
            for ($i = 0; $i < 7; $i++) {
                DB::table('asistencias')->insert([
                    'id_empleado' => $idEmpleado,
                    'fecha' => $inicioSemana->copy()->addDays($i)->toDateString(),
                    'hora_entrada' => '08:00:00',
                    'hora_salida' => '16:00:00',
                    'horas_trabajadas' => 8,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
