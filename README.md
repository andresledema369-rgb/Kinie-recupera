# Recupera — Kinesiología y Rehabilitación

Sitio web estático (HTML/CSS/JS puro, sin dependencias ni build step) para el consultorio de kinesiología "Recupera", en Cerro de las Rosas, Córdoba.

## Estructura

```
/
├── index.html        Inicio
├── servicios.html    Servicios y precios
├── nosotros.html     Equipo
├── contacto.html     Contacto
├── js/main.js        Menú móvil, scroll del header y animaciones (vanilla JS)
└── images/           Logo, fotos de portada y del equipo
```

## Despliegue

Es un sitio 100% estático: no requiere Node, build ni backend. Para publicarlo alcanza con subir el contenido de este repositorio tal cual a cualquier hosting estático (Hostinger, GitHub Pages, Netlify, Vercel, etc.), sirviendo `index.html` como raíz.

## Contacto del sitio

El sitio no tiene backend ni base de datos todavía: el contacto se resuelve con enlaces directos a WhatsApp (`wa.me`) y `mailto:`. Un formulario con backend real (envío de mensajes, turnos online, panel de administración) queda pendiente para una siguiente etapa.
