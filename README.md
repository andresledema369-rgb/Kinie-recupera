# Recupera — Kinesiología y Rehabilitación

Sitio web estático (HTML/CSS/JS puro, sin dependencias ni build step) para el consultorio de kinesiología "Recupera", en Cerro de las Rosas, Córdoba.

## Estructura

```
/
├── index.html                  Inicio
├── servicios.html              Servicios y precios
├── nosotros.html               Equipo
├── contacto.html               Contacto
├── evaluacion-inicial.html     Landing de conversión (standalone)
├── js/main.js                  Menú móvil, scroll del header y animaciones (vanilla JS)
├── js/evaluacion-inicial.js    Scroll, reveals y formulario de la landing
└── images/                     Logo, fotos de portada y del equipo
```

### Landing "Evaluación inicial"

`evaluacion-inicial.html` es una página de conversión independiente, pensada para
campañas y para compartir por WhatsApp e Instagram. **A propósito no tiene menú de
navegación ni el footer institucional**: no ofrece salidas hacia las otras páginas,
para mantener el foco en reservar la evaluación. Comparte la identidad visual (logo,
paleta, tipografías) y reutiliza las imágenes de `images/`.

## Despliegue

Es un sitio 100% estático: no requiere Node, build ni backend. Para publicarlo alcanza con subir el contenido de este repositorio tal cual a cualquier hosting estático (Hostinger, GitHub Pages, Netlify, Vercel, etc.), sirviendo `index.html` como raíz.

## Contacto del sitio

El sitio no tiene backend ni base de datos todavía: el contacto se resuelve con enlaces directos a WhatsApp (`wa.me`) y `mailto:`. Un formulario con backend real (envío de mensajes, turnos online, panel de administración) queda pendiente para una siguiente etapa.

El formulario de `evaluacion-inicial.html` valida en el cliente y muestra un estado de
confirmación, **pero todavía no persiste el lead en ningún lado**. El punto de
integración está marcado con `TODO(Supabase)` en `js/evaluacion-inicial.js`. Mientras
tanto, la pantalla de confirmación ofrece el botón de WhatsApp para que el paciente
pueda contactarse igual.
