<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asistencia;

class AsistenciaController extends Controller
{
    public function asistenciasPorSemana(Request $request)
    {
        $inicio = $request->query('inicio');
        $fin = $request->query('fin');

        if (!$inicio || !$fin) {
            return response()->json(['error' => 'Fechas incompletas'], 400);
        }

        return Asistencia::whereBetween('fecha', [$inicio, $fin])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_empleado' => 'required|exists:empleados,id',
            'fecha' => 'required|date',
            'hora_entrada' => 'required|date_format:H:i',
            'hora_salida' => 'nullable|date_format:H:i',
            'horas_trabajadas' => 'nullable|numeric'
        ]);

        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        $asistencia = Asistencia::create($validated);

        return response()->json(['message' => 'Asistencia registrada', 'data' => $asistencia]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'hora_entrada' => 'required|date_format:H:i',
            'hora_salida' => 'nullable|date_format:H:i',
            'horas_trabajadas' => 'nullable|numeric'
        ]);

        $validated['updated_at'] = now();

        $asistencia = Asistencia::findOrFail($id);
        $asistencia->update($validated);

        return response()->json(['message' => 'Asistencia actualizada', 'data' => $asistencia]);
    }

    public function destroy($id)
    {
        $asistencia = Asistencia::findOrFail($id);
        $asistencia->delete();

        return response()->json(['message' => 'Asistencia eliminada']);
    }
}
