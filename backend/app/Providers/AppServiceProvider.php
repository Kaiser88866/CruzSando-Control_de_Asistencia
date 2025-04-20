<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Carga manual de rutas desde routes/api.php
        $this->loadRoutesFrom(base_path('routes/api.php'));
    }
}
