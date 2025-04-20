<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ResumenAsistenciaController;
use App\Http\Controllers\EnvioController;
use App\Http\Controllers\PrendaEnvioController;
use App\Http\Controllers\DatosTrasladoController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\AsistenciaController;

// Asegúrate de envolver TODO en un prefix
Route::prefix('api')->group(function () {

    Route::get('/ping', function () {
        return ['message' => 'pong'];
    });

    Route::get('/asistencias-semana', [ResumenAsistenciaController::class, 'semanaActual']);

    Route::post('/empleados', [EmpleadoController::class, 'store']);

    Route::post('/empleados/{id}', [EmpleadoController::class, 'update']);

    Route::post('/empleados/{id}/eliminar-huella', [EmpleadoController::class, 'eliminarHuella']);

    Route::get('/empleados', [EmpleadoController::class, 'index']);

    Route::get('/envios', [EnvioController::class, 'index']);
    Route::post('/envios', [EnvioController::class, 'store']);
    Route::put('/envios/{id}', [EnvioController::class, 'update']);

    Route::get('/prendas_envio', [PrendaEnvioController::class, 'index']);
    Route::post('/prendas_envio', [PrendaEnvioController::class, 'store']);
    Route::put('/prendas_envio/{id}', [PrendaEnvioController::class, 'update']);
    Route::delete('/prendas_envio/{id}', [PrendaEnvioController::class, 'destroy']);

    Route::get('/datos_traslado/{envio_id}', [DatosTrasladoController::class, 'show']);
    Route::post('/datos_traslado', [DatosTrasladoController::class, 'store']);

    Route::get('/asistencias/semana', [AsistenciaController::class, 'asistenciasPorSemana']);
    Route::post('/asistencia', [AsistenciaController::class, 'store']);
    Route::put('/asistencia/{id}', [AsistenciaController::class, 'update']);
    Route::delete('/asistencia/{id}', [AsistenciaController::class, 'destroy']);
});
