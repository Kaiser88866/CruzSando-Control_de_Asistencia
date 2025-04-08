# CruzSando-Control_de_Asistencia

<h1 align="center">🖐️ Control de Asistencia con Huella Digital</h1>
<p align="center">
  Sistema integral para maquilas familiares — funciona 100% local 🖥️
</p>

---

## 🎯 Objetivo

Desarrollar un sistema completo que:

✅ Registre entradas y salidas mediante **huella digital**  
✅ Calcule pagos de forma **automática**  
✅ Genere **reportes y etiquetas** en PDF  
✅ Gestione **envíos de producción**  
✅ Funcione **sin conexión a internet**, todo en una sola computadora

---

## 🧩 Tecnologías Utilizadas

| Área       | Herramientas clave |
|------------|--------------------|
| **IoT**    | Arduino Mega 2560, GT-521F52, Ethernet Shield W5100 |
| **Backend**| Laravel 11, PHP 8.3, SQLite, Sanctum |
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

⚙️ Instalación Rápida
🔧 Requisitos
PHP ≥ 8.3

Composer

Node.js + npm

Git
