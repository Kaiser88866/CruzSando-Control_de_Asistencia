<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResumenAsistenciaController extends Controller
{
    #[Route('api/asistencias-semana', methods: ['GET'])]
    public function semanaActual()
    {
        $inicioSemana = Carbon::now()->startOfWeek(); // lunes
        $finSemana = Carbon::now()->endOfWeek(); // domingo

        $asistencias = DB::table('asistencias')
            ->join('empleados', 'asistencias.id_empleado', '=', 'empleados.id')
            ->whereBetween('asistencias.fecha', [$inicioSemana->toDateString(), $finSemana->toDateString()])
            ->where('empleados.estado', 'activo')
            ->select('empleados.id', 'empleados.nombre', 'asistencias.fecha', 'asistencias.hora_entrada')
            ->get();

        $empleados = [];

        foreach ($asistencias as $registro) {
            $nombre = $registro->nombre;
            $dia = Carbon::parse($registro->fecha)->locale('es')->dayOfWeekIso;

            if (!isset($empleados[$nombre])) {
                $empleados[$nombre] = [
                    'nombre' => $nombre,
                    'lunes' => null,
                    'martes' => null,
                    'miércoles' => null,
                    'jueves' => null,
                    'viernes' => null,
                    'sábado' => null,
                    'domingo' => null,
                ];
            }

            $dias = [1 => 'lunes', 2 => 'martes', 3 => 'miércoles', 4 => 'jueves', 5 => 'viernes', 6 => 'sábado', 7 => 'domingo'];
            $empleados[$nombre][$dias[$dia]] = substr($registro->hora_entrada, 0, 5);
        }

        return array_values($empleados);
    }
}
