# Malas finanzas

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Webflow Cloud](https://img.shields.io/badge/Deploy-Webflow%20Cloud-146EF5?logo=webflow&logoColor=white)
![Nerdearla 2026](https://img.shields.io/badge/Nerdearla-2026-7B3FE4)

Calculadora de ingresos y egresos que muestra tu balance al instante, lo grafica por categoría y te deja descargar todo en Excel o PDF.

![Vista principal de Malas finanzas](docs/captura-principal.png)

## Sobre el desafío

Este proyecto fue creado para el **App Challenge de Webflow en Nerdearla 2026**, realizado en la Ciudad Cultural Konex (Buenos Aires) del 22 al 26 de septiembre de 2026.

La consigna era construir una aplicación fullstack que funcione de verdad, desplegarla en **Webflow Cloud** y dejarla accesible desde una URL pública. Un equipo de ingenieros de Webflow elige un ganador en cada categoría: Mejor Tech, Mejor Diseño y Mejor del Show.

Más información en la [página oficial del desafío](https://nerdearla-app-showcase.webflow.io/).

## Qué hace

- **Carga de movimientos:** registrás cada ingreso o egreso con fecha, descripción, categoría y monto.
- **Balance automático:** los totales de ingresos, egresos y balance se recalculan en cada cambio, en pesos argentinos. Si el balance queda negativo, la tarjeta se pone en rojo.
- **Gráfico por categoría:** barras que comparan lo que entra y lo que sale en cada categoría, para ver rápido a dónde se va la plata.
- **Exportación a Excel (.xlsx):** genera un libro con dos hojas, una con todos los movimientos y otra con el resumen por categoría.
- **Exportación a PDF:** genera un reporte con los totales y la tabla completa de movimientos.
- **Datos persistentes:** los movimientos se guardan en el navegador, así que no se pierden al recargar la página.

## Capturas

| Carga de movimientos y balance | Gráfico por categoría |
| --- | --- |
| ![Formulario y totales](docs/captura-formulario.png) | ![Gráfico por categoría](docs/captura-grafico.png) |

| Reporte en PDF | Exportación a Excel |
| --- | --- |
| ![Reporte PDF](docs/captura-pdf.png) | ![Archivo Excel](docs/captura-excel.png) |

## Tecnologías

- **[Next.js](https://nextjs.org/)** con App Router y **React**, escrito en **TypeScript**.
- **[Webflow Cloud](https://developers.webflow.com/webflow-cloud)** para el hosting, que ejecuta la app sobre la infraestructura de Cloudflare mediante el adaptador **OpenNext**.
- **[SheetJS](https://sheetjs.com/)** para generar los archivos Excel.
- **[jsPDF](https://github.com/parallax/jsPDF)** y **jsPDF-AutoTable** para generar los reportes en PDF.

Las librerías de exportación se cargan desde un CDN solo cuando el usuario toca un botón de descarga. Así la página inicial carga más rápido y el proyecto no suma dependencias al build.

## Cómo funciona el despliegue

El repositorio está conectado a Webflow Cloud con despliegue continuo: cada commit en la rama `main` dispara automáticamente un nuevo build y deploy, y la app se actualiza en la misma URL.

## Correr el proyecto localmente

Necesitás Node.js y npm instalados.

```bash
git clone https://github.com/Jean5011/mis-finanzas.git
cd mis-finanzas
npm install
npm run dev
```

Después abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura principal

```
src/app/
├── page.tsx          # Toda la app: formulario, totales, gráfico, tabla y exportaciones
├── layout.tsx        # Layout raíz de Next.js
└── globals.css       # Estilos globales de la plantilla
wrangler.json         # Configuración del entorno de ejecución
open-next.config.ts   # Adaptador de Next.js para Webflow Cloud
```

## Ideas a futuro

- Guardar los movimientos en la base SQLite de Webflow Cloud para acceder desde cualquier dispositivo.
- Filtros por mes y comparación entre períodos.
- Presupuestos por categoría con alertas cuando te pasás.

## Autor

Hecho por **Jean Pierre Esquen** ([@Jean5011](https://github.com/Jean5011)) para el App Challenge de Webflow × Nerdearla 2026.

---

## Ver el proyecto

La app está desplegada y disponible en:

### 👉 [https://mis-finanzas-916528.webflow.io/](https://mis-finanzas-916528.webflow.io/)
