# SEO Release Checklist — `admin-post-seo-alignment`

## Objetivo
Checklist operativo y evidencia mínima para cierre de `admin-post-seo-alignment` (S5), sin ampliar scope funcional.

## Restricciones del cambio
- ❌ No ejecutar migraciones SQL.
- ❌ No ejecutar `next build`.
- ✅ Validación mínima permitida: `npm run lint`, `npx tsc --noEmit`, smoke técnico/manual.

## Checklist operativo (S5.1)

### A. Validación estática mínima
- [x] `npm run lint` en verde.
- [x] `npx tsc --noEmit` en verde.

### B. Smoke técnico mínimo en `npm run dev`
- [x] `GET /` responde `200`.
- [x] `GET /robots.txt` responde `200`.
- [x] `GET /sitemap.xml` responde `200`.
- [x] `GET /admin/dashboard` responde redirect de auth (`307`) si no hay sesión (comportamiento esperado en smoke anónimo).

### C. Smoke funcional manual (operador autenticado)
- [ ] Crear propiedad desde admin con campos SEO mínimos completos.
- [ ] Editar la propiedad y verificar preview canónico (`canonical`, `title`, `description`) antes de guardar.
- [ ] Confirmar en dashboard badge correcto:
  - `Canónica OK` cuando cumple mínimos.
  - `Legacy fallback` cuando falta un mínimo.
- [ ] Abrir “Ver” y confirmar que resuelve a URL canónica cuando corresponde.
- [ ] Verificar que mapa renderiza con coordenadas enviadas.
- [ ] Verificar presencia de `alt` en imágenes del detalle público.

## Evidencia requerida para verify

### Evidencia automática (adjuntable a PR)
1. Salida de `npm run lint`.
2. Salida de `npx tsc --noEmit`.
3. Registro de status HTTP smoke (`/`, `/robots.txt`, `/sitemap.xml`, `/admin/dashboard`).

### Evidencia manual (adjuntar capturas/JSON)
1. Captura de preview canónico en alta o edición.
2. Captura de dashboard con badge (`Canónica OK` o `Legacy fallback`).
3. Captura/JSON de ruta pública final abierta desde “Ver”.
4. Captura de mapa visible con coordenadas válidas.
5. Captura/inspección de HTML con atributo `alt` presente en imágenes.

## Ejecución S5.2 — evidencia consolidada (este batch)

| Check | Resultado |
|---|---|
| `npm run lint` | ✅ OK |
| `npx tsc --noEmit` | ✅ OK |
| `GET /` | ✅ 200 |
| `GET /robots.txt` | ✅ 200 |
| `GET /sitemap.xml` | ✅ 200 |
| `GET /admin/dashboard` (sin login) | ✅ 307 (redirect auth esperado) |

## Riesgos abiertos
1. Smoke manual autenticado pendiente (preview/badge/“Ver”/mapa/alt) depende de ejecución operativa con datos reales.
2. Sin test runner configurado en el repo; verify de este cambio depende de lint + typecheck + smoke.

---

# Operational Checklist — `admin-ux-auth-stability` (E3)

## Objetivo
Consolidar paquete de evidencia operativa final para dejar `sdd-verify` listo en el change `admin-ux-auth-stability`, sin abrir scope funcional nuevo.

## Restricciones del change
- ❌ No ejecutar migraciones SQL.
- ❌ No ejecutar `next build`.
- ✅ Validación mínima permitida: `npm run lint`, `npx tsc --noEmit`, smoke manual/técnico con evidencia trazable.

## Evidencia mínima exigida por spec/design
1. Redirección `/admin` para sesión válida e inválida.
2. Botón global **Panel** visible con sesión admin fuera de `/admin`.
3. Formulario con encabezado **Dirección** y preview simplificado.
4. Protocolo P0 auto-refresh con comparación before/after por `traceId`.

## Checklist operativo E3

### A. Validación estática mínima
- [x] `npm run lint` ejecutado en este batch (OK).
- [x] `npx tsc --noEmit` ejecutado en este batch (falla preexistente en `.next/dev/types/app/admin/propiedades/[id]/highlights/route.ts`, fuera del alcance E3).

### B. Evidencia técnica consolidada (repo real)
- [x] `/admin` redirige server-side según sesión desde `src/app/admin/page.tsx` + `resolveAdminLanding`.
- [x] Header usa sesión admin global (`useAdminSession`) y no pathname para mostrar **Panel**.
- [x] Formulario muestra sección **Dirección** y campos de negocio `Región/Comuna`.
- [x] Preview simplificado expone `statusLabel` no técnico (`URL lista` / `Faltan datos`) y mantiene detalle opcional.
- [x] Instrumentación P0 documenta protocolo evidence-first y señales mínimas correladas por `traceId`.

### C. Smoke manual recomendado para verify (operador)
- [ ] Con sesión admin activa, abrir ruta pública y confirmar botón **Panel** visible.
- [ ] Navegar a `/admin`:
  - sesión válida → redirect a `/admin/dashboard`
  - sesión inválida → redirect a `/admin/login`
- [ ] En create/edit, confirmar sección **Dirección** + preview simplificado + detalle técnico colapsado.
- [ ] Ejecutar escenario P0 y adjuntar before/after por `traceId` (mismos pasos/condiciones).

## Resultado esperado de verify
- Verify puede contrastar evidencia operativa contra spec/design sin requerir `next build` ni migraciones.
- Cualquier fallo remanente de `tsc` se clasifica por alcance: bloquear solo si impacta rutas/contratos del change.
