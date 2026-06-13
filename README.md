# 📊 Reportes Ayres — Bot Martina · AgentBot

Dashboard de reportes diarios del Bot Martina (Hotel Ayres del Champaquí). Una vista limpia, estética iOS/glass, de todo lo que pasa en producción: métricas, embudo, derivaciones, errores, fixes, calidad del bot y acciones humanas pendientes.

## Stack
Vite + React 18 + TypeScript + Tailwind CSS + Recharts + Framer Motion + Lucide. Sin backend: los reportes viven tipados en `src/data/reports.ts`.

## Desarrollo
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
```

## Deploy en Vercel
Vercel autodetecta Vite. Build command `npm run build`, output `dist`. El `vercel.json` ya está incluido.

## Cómo agregar un día nuevo
Editá `src/data/reports.ts` y agregá un objeto `DayReport` al principio del array `reports` (el más reciente primero). La estructura está tipada en `src/types.ts`. El selector de fecha del header lo toma automáticamente.

## Secciones
- **Resumen** — KPIs, embudo, habitaciones, lo que funcionó
- **Embudo** — conversión etapa por etapa
- **Derivaciones** — cuántas y por qué (con desglose)
- **Calidad del bot** — alucinaciones, formato, adherencia
- **Errores & Fixes** — bugs con causa raíz, severidad, estado y corrección
- **Acción humana** — leads que el equipo debe retomar
- **Bitácora** — timeline de cambios, monitoreo y predicción de errores

---
Construido por Claude para AgentBot · Datos reales de Chatwoot + n8n.
