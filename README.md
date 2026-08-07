# Generador ADR HP Latex Print & Cut

Aplicacion privada Next.js para generar senales ADR vectoriales con sangrado, imposicion en bobina ATP y PDF de produccion con tinta plana `CutContour`.

## Requisitos

- Node.js 22+
- PostgreSQL
- Variables de `.env.example`

## Desarrollo local

```bash
npm install
npm run db:migrate
npm run bootstrap:admin
npm run dev
```

Define antes `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD`.

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
- `npm run start`

## Privacidad

No hay tablas de trabajos, PDFs, SVG subidos ni historial. El SVG se procesa en el navegador y el endpoint PDF vuelve a sanear entrada, genera el PDF en memoria y responde con cabeceras `no-store`.

## Plantillas

La plantilla incluida es una demo tecnica en `public/templates/adr/class-1-demo.svg`. Para produccion legal, sustituye ese SVG por la plantilla autorizada manteniendo los identificadores requeridos del manifiesto.

## Fuente

La app incluye Noto Sans local en `public/fonts/noto-sans`. Los campos ADR se convierten a trazados vectoriales antes de exportar para no depender de fuentes instaladas en PosterShop.

## ONYX

El flujo previsto es: aplicacion web -> PDF vectorial con `/Separation /CutContour` -> ONYX PosterShop/RIP-Queue -> HP Latex 830W -> CUT-Server -> HP Latex 64 Plus Cutter. La prueba fisica queda documentada en `docs/onyx-validation-checklist.md`.

## Seenode

Ver `docs/deployment-seenode.md`. El arranque ejecuta migraciones y bootstrap administrativo idempotente.
