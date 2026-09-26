# Malas finanzas

Calculadora de ingresos y egresos que muestra el balance en tiempo real, grafica los movimientos por categoría y exporta los datos a Excel (.xlsx) y PDF.

> Proyecto creado para el **App Challenge de Webflow en Nerdearla 2026**, realizado en la Ciudad Cultural Konex (Buenos Aires, del 22 al 26 de septiembre de 2026). El desafío consistía en construir una app que funcione y desplegarla en Webflow Cloud.

## Funcionalidades

- **Carga de movimientos:** cada ingreso o egreso tiene fecha, descripción, categoría y monto.
- **Balance automático:** los totales de ingresos, egresos y el balance se recalculan al instante. Si el balance es negativo, se resalta en rojo.
- **Gráfico por categoría:** barras comparativas de lo que entra y lo que sale en cada categoría.
- **Exportación a Excel:** genera un archivo `.xlsx` con dos hojas, una con los movimientos y otra con el resumen por categoría.
- **Exportación a PDF:** genera un reporte con los totales y la tabla completa de movimientos.
- **Persistencia local:** los datos se guardan en el navegador, así que no se pierden al recargar la página.
- **Diseño responsive y accesible:** se adapta a celulares, se puede usar con teclado y respeta la preferencia de movimiento reducido.

## Tecnologías

- [Next.js](https://nextjs.org/) (App Router) y React
- [Webflow Cloud](https://developers.webflow.com/webflow-cloud) para el hosting, que corre sobre Cloudflare mediante [OpenNext](https://opennext.js.org/)
- [SheetJS](https://sheetjs.com/) para generar los archivos Excel
- [jsPDF](https://github.com/parallax/jsPDF) y jsPDF-AutoTable para generar los PDF

Las librerías de exportación se cargan desde un CDN recién cuando el usuario toca el botón de descarga. Así la página carga más rápido y el proyecto no suma dependencias al build.

## Cómo correrlo localmente

Requisitos: Node.js 22 o superior y npm.

```bash
git clone https://github.com/Jean5011/mis-finanzas.git
cd mis-finanzas
npm install
npm run dev
```

Después abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Despliegue

El proyecto usa despliegue continuo: cada commit en la rama `main` dispara automáticamente un build y un deploy nuevo en Webflow Cloud.

## Estructura principal

```
src/app/
├── page.tsx      # La app completa: formulario, totales, gráfico, tabla y exportaciones
├── layout.tsx    # Layout base de Next.js
└── globals.css   # Estilos globales de la plantilla
```

## Autor

Hecho por [Jean Pierre Esquen](https://github.com/Jean5011) para el App Challenge de Webflow en Nerdearla 2026.

---

## Ver el proyecto

La app está publicada y se puede usar acá:

**[https://mis-finanzas-916528.webflow.io/](https://mis-finanzas-916528.webflow.io/)**
