<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmpleadoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_pago' => 'required|string',
            'pago_unitario' => 'required|numeric',
            'tipo_empleado' => 'required|string',
        ]);

        $validated['estado'] = 'activo';
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        $empleado = DB::table('empleados')->insert($validated);

        return response()->json(['message' => 'Empleado registrado', 'data' => $empleado]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_pago' => 'required|string',
            'pago_unitario' => 'required|numeric',
            'tipo_empleado' => 'required|string',
            'estado' => 'required|string',
        ]);

        $validated['updated_at'] = now();

        DB::table('empleados')->where('id', $id)->update($validated);

        return response()->json(['message' => 'Empleado actualizado']);
    }

    public function eliminarHuella($id)
    {
        DB::table('empleados')->where('id', $id)->update([
            'codigo_huella' => null,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Huella eliminada correctamente']);
    }

    public function index()
    {
        $empleados = DB::table('empleados')->orderBy('created_at', 'desc')->get();
        return response()->json($empleados);
    }
}
