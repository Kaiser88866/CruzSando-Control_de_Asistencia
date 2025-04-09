<h1 align="center">🖐️ Control de Asistencia con Huella Digital</h1>
<p align="center">
  Sistema integral para maquilas CruzSando — funciona 100% local 🖥️
</p>

---

## 🌟 Objetivo

Desarrollar un sistema completo que:

✅ Registre entradas y salidas mediante **huella digital**  
✅ Calcule pagos de forma **automática**  
✅ Genere **reportes y etiquetas** en PDF  
✅ Gestione **envíos de producción**  
✅ Funcione **sin conexión a internet**, todo en una sola computadora

---

## 🧹 Tecnologías Utilizadas

| Área       | Herramientas clave |
|------------|--------------------|
| **IoT**    | Arduino Mega 2560, GT-521F52, Ethernet Shield W5100 |
| **Backend**| Laravel 11, PHP 8.2.18, SQLite, Sanctum |
| **Frontend**| Electron, Tailwind CSS, DataTables.js, SweetAlert2, jsPDF |
| **Base de datos** | SQLite (archivo `.sqlite` local) |

---

## 🗂️ Estructura del Proyecto

```plaintext
control-asistencia/
├── backend/               # Laravel + SQLite
└── frontend/              # Aplicación de escritorio con Electron
    ├── main.js
    ├── preload.js
    ├── package.json
    ├── /public/           # Vistas HTML
    ├── /assets/           # Estilos, imágenes
    └── /js/               # Lógica de vistas
```

---

## ⚙️ Instalación Rápida

### 🔧 Requisitos

- PHP ≥ 8.3
- Composer
- Node.js + npm
- Git

### 🧱 Clonar el proyecto

```bash
git clone https://github.com/Kaiser88866/CruzSando-Control_de_Asistencia.git
cd CruzSando-Control_de_Asistencia
```

### 🚀 Backend Laravel

```bash
cd backend
composer install
cp .env.example .env

# En .env cambia la configuración de base de datos:
DB_CONNECTION=sqlite
DB_DATABASE=${DB_DATABASE}/database/database.sqlite

# Genera archivo vacío si no existe
mkdir database
type nul > database/database.sqlite

php artisan key:generate
php artisan migrate
```

### 💻 Frontend Electron

```bash
cd ../frontend
npm install
npm run dev  # Levanta Laravel + Electron simultáneamente
```

---

## 🛡️ Seguridad

- Acceso controlado localmente
- Laravel con Sanctum para futuras autenticaciones
- CORS restringido a `localhost`
- Arduino dentro de caja metálica (acceso físico restringido)

---

## 🗕️ Migraciones

```bash
# Tablas principales:
- empleados
- asistencias
- pagos
- envios
- prendas_envio
```

Incluye relación entre asistencias, periodos de pago, control de envíos y detalle por prenda (con precio, corte y talla).

---

## 🔁 Flujo de Datos

1. 👆 El empleado coloca su dedo ➔ sensor GT-521F52 genera un ID.
2. 📡 Arduino intenta enviar POST `/api/asistencia` a Laravel.
3. 📀 Si no hay conexión, guarda en microSD para reintento posterior.
4. 🧠 Laravel registra en SQLite y lo refleja en la app de escritorio.
5. 📤 Desde Electron se generan reportes y etiquetas PDF para envíos.

---

## 💊 Reportes Generados

- Lista de asistencias por rango de fechas
- Cálculo de pagos por empleado y periodo
- Etiquetas de envío por prenda
- Exportación a PDF y CSV

---

## 🧫 Consideraciones

- Laravel puede registrarse como **servicio de Windows** para ejecutarse automáticamente.
- Arduino incluye un **reintento automático** de envíos si no hay red.
- Precio unitario por prenda queda **registrado como histórico** incluso si luego cambia.

---

## 🧑‍💻 Autor

Desarrollado por **Sergio Omar Cruz Mendoza**  
[GitHub: @Kaiser88866](https://github.com/Kaiser88866)

---

## 🗦️ Licencia

Proyecto de uso privado para entorno familiar. Puedes adaptarlo para tus propios fines con atribución al repositorio original.

