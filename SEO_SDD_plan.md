# SEO SDD Implementation Plan

## 1) Objetivos

- [ ] Implementar el plan SEO de `plan-seo.md` en este proyecto Next.js + Supabase con ejecución guiada por SDD y delegación a subagentes.
- [ ] Migrar la arquitectura de URLs desde el esquema actual (`/propiedades` y `/propiedades/[slug]`) hacia jerarquía SEO por tipo/operación/región/comuna.
- [ ] Garantizar metadatos dinámicos, Open Graph, JSON-LD, sitemap y robots consistentes con los datos reales de Supabase.
- [ ] Incorporar soporte de mapa en ficha (Leaflet + OSM) y mejoras de imágenes SEO sin romper UX ni rutas existentes en transición.
- [ ] Definir un flujo operativo reproducible para orquestador (fases, DAG, batches, criterios de aceptación, rollback y release).

## 2) Alcance / No alcance

### Alcance

- [ ] Implementación frontend/backend app-level en `src/app`, `src/components`, `src/lib`, `src/types`.
- [ ] Definición de contratos de datos post-migración y adaptación de queries Supabase.
- [ ] Implementación técnica SEO on-page + técnico (metadata, OG, schema, sitemap, robots, canonical/noindex por estado).
- [ ] Plan de verificación sin `next build` (por restricción operativa).
- [ ] Artefactos SDD (explore/propose/spec/design/tasks/apply/verify/archive) en modo orquestado.

### No alcance

- [ ] Ejecutar migraciones SQL de producción desde el agente.
- [ ] Alta/configuración de Google Business Profile (solo checklist operativo).
- [ ] Producción de fotografía profesional/dron (solo dependencia externa).
- [ ] Cambios de infraestructura DNS/hosting fuera de config app (solo validaciones/checklist).

## 3) Prerrequisitos

- [ ] `plan-seo.md` tomado como fuente funcional principal.
- [ ] Dominio final confirmado (ejemplo esperado: `https://propiedadesrm.cl`) antes de cerrar metadataBase y sitemap.
- [ ] Variables de entorno Supabase correctas para entorno de trabajo (`.env.local`).
- [ ] Acceso humano a DB para ejecutar migración manual SQL y carga inicial.
- [ ] Alineación de naming slug entre DB y frontend (`property_type_slug`, `region_slug`, `commune_slug`, `slug`).
- [ ] Definir teléfono default de contacto y política fallback (ya existe en `src/config/contact.ts`).

## 4) Arquitectura actual validada (estado real del repo)

### Hallazgos validados

- [x] App Router activo en `src/app` (no `app` root): `src/app/layout.tsx`, `src/app/page.tsx`.
- [x] Rutas de propiedades actuales:
  - `src/app/propiedades/page.tsx`
  - `src/app/propiedades/[slug]/page.tsx`
- [x] Metadata actual global es estática y mínima en `src/app/layout.tsx`.
- [x] No existe `src/app/sitemap.ts` ni `src/app/robots.ts` actualmente.
- [x] `next.config.ts` ya permite imágenes remotas de Supabase Storage.
- [x] Tipo `Property` actual no incluye campos SEO nuevos (`property_type`, `for_sale`, `for_rent`, `region_slug`, `commune_slug`, `latitude`, `longitude`) en `src/types/property.ts`.
- [x] Ficha actual usa `location_text` y ruta por slug simple, sin jerarquía geográfica.

### Implicancia técnica

- [ ] Hay deuda de compatibilidad entre el plan SEO objetivo y la forma actual de rutas/datos.
- [ ] Se recomienda migración en paralelo con redirecciones/canonical temporal para evitar pérdida de indexación.

## 5) Estrategia SDD (fases y DAG)

### Modo recomendado

- [ ] `artifact_store.mode = engram` (mínimo) o `hybrid` (recomendado si también quieren artefactos en archivo).
- [ ] Orquestador delega siempre a subagentes por fase; no ejecutar implementación inline.

### DAG operativo

```text
explore -> propose -> spec -> design -> tasks -> apply(batch-n) -> verify -> archive
                                      \------------------------------------^
```

### Fases

- [ ] F0 Discover/Recovery: recuperar contexto y validar estado del repo contra `plan-seo.md`.
- [ ] F1 Propuesta: alcance exacto, riesgos y secuencia de rollout.
- [ ] F2 Especificación: requisitos testables + escenarios por frente SEO.
- [ ] F3 Diseño técnico: rutas, módulos, contratos de datos y estrategia de compatibilidad.
- [ ] F4 Tasks: batches pequeños, ordenados por dependencia.
- [ ] F5 Apply: ejecutar batches secuenciales con checkpoints.
- [ ] F6 Verify: validar cumplimiento spec/design/tasks.
- [ ] F7 Archive: cerrar cambio y dejar traza operativa para futuras iteraciones.

## 6) Cambios por frente

## 6.1 Routing

- [ ] Implementar jerarquía objetivo:
  - `/propiedades`
  - `/[tipo]/[operacion]`
  - `/[tipo]/[operacion]/[region_slug]`
  - `/[tipo]/[operacion]/[region_slug]/[commune_slug]`
  - `/[tipo]/[region_slug]/[commune_slug]/[slug]` (ficha sin operación)
- [ ] Mantener compatibilidad transitoria de `/propiedades/[slug]` con redirección 301 a ruta canónica nueva.
- [ ] Incorporar constantes de taxonomía SEO en `src/lib/seo/constants.ts`.
- [ ] Filtrar listados por `for_sale` / `for_rent` vía mapeo `operacion -> campo DB`.

## 6.2 Metadata

- [ ] Convertir metadata global a estructura completa (`metadataBase`, OG/Twitter base).
- [ ] Implementar `generateMetadata` en listados jerárquicos con títulos únicos.
- [ ] Implementar `generateMetadata` en ficha con labels dinámicos según `for_sale`/`for_rent`.
- [ ] Agregar canonical en páginas clave y estrategia `noindex` para propiedades no activas si aplica negocio.

## 6.3 Open Graph

- [ ] Definir fallback `public/og-default.jpg` (1200x630).
- [ ] Adjuntar OG dinámico por página con imagen principal o fallback.
- [ ] Fase opcional: `opengraph-image.tsx` por propiedad (siempre después de base estable).

## 6.4 Schema.org

- [ ] Crear `src/components/seo/PropertyJsonLd.tsx` (`RealEstateListing` + `Offer` + `PostalAddress`).
- [ ] Incluir JSON-LD organización (`RealEstateAgent`) en layout.
- [ ] Ajustar `availability` según `status` y contemplar precio opcional.

## 6.5 Sitemap / robots

- [ ] Crear `src/app/sitemap.ts` (rutas estáticas + fichas dinámicas).
- [ ] Crear `src/app/robots.ts` apuntando al sitemap final.
- [ ] Excluir rutas administrativas del índice (por convención robots y no enlazado).

## 6.6 Imágenes SEO

- [ ] Validar uso consistente de `next/image` en cards y ficha.
- [ ] Estandarizar `alt` descriptivos por propiedad, no genéricos.
- [ ] Priorizar imagen principal en ficha y lazy para secundarias.

## 6.7 Mapa de propiedad

- [ ] Implementar `src/components/map/PropertyMap.tsx` con `react-leaflet`.
- [ ] Cargar vía `dynamic(..., { ssr: false })` en ficha.
- [ ] Render condicional solo si existen `latitude` y `longitude` válidos.

## 7) Contratos de datos esperados post-migración

## 7.1 Regla crítica de ownership

- [ ] La migración SQL de DB la ejecuta un humano manualmente.
- [ ] El agente NO corre `ALTER TABLE` en producción ni staging.
- [ ] El agente solo asume el esquema final y adapta código/query/tipos.

## 7.2 Esquema esperado en `properties`

- [ ] Campos existentes: `id`, `title`, `slug`, `description`, `price`, `area_m2`, `status`, `highlighted`, `contact_phone`, `images`, `created_at`.
- [ ] Campos nuevos requeridos:
  - `property_type` (`terreno | casa | local_comercial | departamento`)
  - `for_sale` (`boolean`)
  - `for_rent` (`boolean`)
  - `region`, `region_slug`
  - `commune`, `commune_slug`
  - `street`, `street_number`
  - `latitude`, `longitude`
- [ ] Constraint esperada: disponible implica al menos una modalidad activa (`for_sale OR for_rent`) salvo estados no disponibles.

## 7.3 Contrato TypeScript esperado

```ts
export type Property = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | null
  area_m2: number | null
  status: "available" | "sold" | "rented"
  highlighted: boolean
  contact_phone: string | null
  images: string[]
  property_type: "terreno" | "casa" | "local_comercial" | "departamento" | null
  for_sale: boolean
  for_rent: boolean
  region: string | null
  region_slug: string | null
  commune: string | null
  commune_slug: string | null
  street: string | null
  street_number: string | null
  latitude: number | null
  longitude: number | null
  created_at?: string
}
```

## 7.4 Contrato de consultas (post-migración)

- [ ] Listado por operación: filtro por `for_sale=true` o `for_rent=true`.
- [ ] Listado por región/comuna: filtro por `region_slug`/`commune_slug`.
- [ ] Ficha canónica: `tipo + region_slug + commune_slug + slug`.
- [ ] Sitemap: usa slugs y `highlighted` para prioridad.

## 8) Task breakdown por batches

## Batch 0 - Baseline y guardrails

- [ ] Inventariar rutas y metadata actuales.
- [ ] Crear módulo de constantes SEO y utilidades de labels/normalización.
- [ ] Preparar feature flags o helpers para transición de rutas.

## Batch 1 - Tipos y capa de datos

- [ ] Extender `src/types/property.ts` con campos post-migración.
- [ ] Adaptar lecturas Supabase en listados/ficha a nuevo contrato.
- [ ] Implementar validaciones defensivas para campos aún nulos durante transición.

## Batch 2 - Routing SEO + compatibilidad

- [ ] Crear nuevas rutas App Router SEO.
- [ ] Mover lógica de listados/ficha a helpers reutilizables.
- [ ] Implementar redirect 301 desde `/propiedades/[slug]` a ruta canónica cuando exista mapping.

## Batch 3 - Metadata + Open Graph

- [ ] Refactor metadata global en `src/app/layout.tsx`.
- [ ] Agregar `generateMetadata` dinámico en listados y ficha.
- [ ] Incorporar fallback OG default.

## Batch 4 - JSON-LD + sitemap + robots

- [ ] Insertar `PropertyJsonLd` en ficha.
- [ ] Agregar schema de organización en layout.
- [ ] Crear `src/app/sitemap.ts` y `src/app/robots.ts`.

## Batch 5 - Imágenes + mapa

- [ ] Revisar/ajustar `next/image` y `alt` SEO.
- [ ] Agregar `PropertyMap` con carga client-only.
- [ ] Render condicional por coordenadas válidas.

## Batch 6 - Hardening + docs operativas

- [ ] Ajustar noindex/canonical para propiedades no disponibles según política final.
- [ ] Validar enlaces internos y breadcrumbs SEO.
- [ ] Cerrar documentación de release/rollback/verificación.

## 9) Criterios de aceptación por fase

## Fase Explore/Propose

- [ ] Existe diagnóstico de brecha entre estado actual y plan SEO.
- [ ] Riesgos priorizados y dependencias externas explícitas (DB manual, dominio).

## Fase Spec/Design

- [ ] Requisitos son testables por URL, metadata, JSON-LD y sitemap.
- [ ] Diseño incluye compatibilidad backward con rutas antiguas.

## Fase Tasks/Apply

- [ ] Cada batch se puede validar de forma aislada sin build.
- [ ] No hay cambios mezclados de admin no relacionados.

## Fase Verify/Archive

- [ ] Se evidencia cumplimiento de cada requisito con pruebas manuales/comandos.
- [ ] Quedan registradas decisiones y runbook de rollback.

## 10) Riesgos y mitigaciones

- [ ] Riesgo: migración DB incompleta o inconsistente.
  - Mitigación: checklist de contrato mínimo + validación previa de columnas antes de deploy.
- [ ] Riesgo: caída de URLs indexadas por cambio de estructura.
  - Mitigación: redirects 301 + canonical consistente + sitemap actualizado.
- [ ] Riesgo: metadata duplicada o inconsistente entre listados/ficha.
  - Mitigación: helper central de generación de títulos/descripciones.
- [ ] Riesgo: Leaflet rompiendo SSR.
  - Mitigación: import dinámico con `ssr:false` y fallback visual.
- [ ] Riesgo: OG sin imagen por registros incompletos.
  - Mitigación: fallback global `og-default.jpg`.
- [ ] Riesgo: indexación de propiedades vendidas arruinando intención comercial.
  - Mitigación: política explícita por estado (`index` vs `noindex`) y banner visible.

## 11) Runbook de rollback

## Triggers de rollback

- [ ] 404/500 masivos en rutas SEO nuevas.
- [ ] Metadata rota (sin title/description) en rutas críticas.
- [ ] Sitemap inválido o robots bloqueando rastreo.

## Pasos

- [ ] Revertir release de frontend al commit estable anterior.
- [ ] Mantener temporalmente rutas legacy `/propiedades` y `/propiedades/[slug]` sin redirección forzada.
- [ ] Desactivar render de mapa si genera errores cliente.
- [ ] Mantener metadata básica estática en layout mientras se corrige generación dinámica.
- [ ] Regenerar sitemap mínimo (home + propiedades + fichas legacy) si el dinámico falla.
- [ ] Abrir incidente con causa raíz y plan de hotfix por batch.

## Roll-forward recomendado

- [ ] Corregir en rama de hotfix con alcance mínimo.
- [ ] Verificar checklist crítica (rutas + metadata + sitemap) antes de redeploy.

## 12) Plan de verificación (sin build)

## Comandos permitidos

- [ ] `npm run lint`
- [ ] `npm run dev`
- [ ] Navegación manual de rutas SEO con inspección de HTML/metadata.

## Checklist técnica de verificación

- [ ] Home y listados nuevos responden 200.
- [ ] Ruta canónica de ficha responde 200.
- [ ] Ruta legacy de ficha redirige 301 a canónica.
- [ ] `<title>` y `<meta name="description">` son únicos por URL.
- [ ] Open Graph completo (`og:title`, `og:description`, `og:image`, `og:url`).
- [ ] JSON-LD válido en ficha (sin campos mal tipados).
- [ ] `/sitemap.xml` incluye rutas nuevas y fichas.
- [ ] `/robots.txt` permite rastreo y apunta a sitemap.
- [ ] Mapa se renderiza solo con coordenadas válidas y sin error de hidratación.
- [ ] Imágenes con `alt` descriptivo y carga optimizada.

## Evidencia esperada

- [ ] Capturas/outputs breves por cada frente validado.
- [ ] Tabla requisito -> evidencia en fase verify.

## 13) Definition of Done (DoD)

- [ ] Todos los frentes SEO del alcance implementados y verificados sin `build`.
- [ ] Contratos de datos post-migración reflejados en tipos + queries + UI.
- [ ] Rutas legacy con estrategia de compatibilidad/redirect definida.
- [ ] Sitemap/robots operativos y metadata canónica coherente.
- [ ] JSON-LD de ficha y organización presentes y válidos.
- [ ] Documentación SDD completa (incluye riesgos, rollback, release checklist).

## 14) Plantillas de prompts para subagentes

## sdd-explore

```text
Objetivo: Auditar brecha entre plan-seo.md y estado actual del repo para SEO técnico en Next.js App Router + Supabase.
Entradas obligatorias: plan-seo.md, rutas actuales en src/app, tipos en src/types/property.ts, metadata actual en src/app/layout.tsx.
Salida esperada:
1) Matriz brecha (actual vs objetivo)
2) Riesgos/dependencias
3) Recomendación de secuencia por batches
No implementes código.
```

## sdd-propose

```text
Objetivo: Proponer cambio SEO integral con alcance, no alcance, riesgos y plan incremental compatible con producción.
Incluir: estrategia de transición de rutas, ownership de migración DB manual humana, y puntos de rollback.
Salida: executive summary + propuesta aprobable por negocio/tech.
No implementes código.
```

## sdd-spec

```text
Objetivo: Redactar requisitos testables para routing, metadata, OG, schema, sitemap/robots, imágenes y mapa.
Formato: requisitos + escenarios Given/When/Then + criterios de aceptación por fase.
Debe contemplar compatibilidad de rutas legacy y política de indexación por status.
No implementes código.
```

## sdd-design

```text
Objetivo: Diseñar arquitectura técnica de implementación SEO en este repo.
Incluir: estructura de carpetas App Router nueva, módulos utilitarios, contratos TS, queries Supabase, redirects, y dependencia de DB manual.
Agregar trade-offs y decisiones clave.
No implementes código.
```

## sdd-tasks

```text
Objetivo: Descomponer implementación en batches ejecutables, pequeños y ordenados por dependencia.
Cada task debe incluir: archivos objetivo, cambio esperado, criterio de validación sin build y riesgo.
Salida en checklist operacional.
No implementes código.
```

## sdd-apply

```text
Objetivo: Implementar SOLO el batch indicado.
Restricciones: no correr next build; no ejecutar migraciones SQL en DB; preservar cambios no relacionados.
Entregar: cambios por archivo, decisiones tomadas, validación local (lint/dev/manual), riesgos residuales.
```

## sdd-verify

```text
Objetivo: Verificar implementación contra spec+design+tasks.
Requerido: matriz requisito -> evidencia, hallazgos (severidad), y veredicto PASS/FAIL.
No proponer cambios fuera del alcance acordado.
```

## sdd-archive

```text
Objetivo: Cerrar el cambio SEO con estado final, evidencias, riesgos abiertos y aprendizaje reusable.
Sincronizar artefactos finales y dejar runbook listo para siguiente iteración.
```

## 15) Checklist operativa de release

## Pre-release

- [ ] Confirmar migración DB manual ejecutada y validada por humano.
- [ ] Confirmar dominio final y `metadataBase` correcto.
- [ ] Confirmar `og-default.jpg` disponible.
- [ ] Correr `npm run lint` en rama release.
- [ ] Verificar rutas críticas manualmente en `npm run dev`.

## Release

- [ ] Deploy en ventana de bajo riesgo.
- [ ] Smoke test inmediato de: home, listado SEO, ficha canónica, sitemap, robots.
- [ ] Verificar redirecciones legacy (301) en URL de muestra.

## Post-release (0-24h)

- [ ] Monitorear 404/500 en rutas nuevas.
- [ ] Validar extracción de metadata/OG con herramientas de inspección.
- [ ] Confirmar sitemap indexable y envío en Search Console.
- [ ] Revisar comportamiento de mapa e imágenes en mobile/desktop.

## Post-release (48-72h)

- [ ] Revisar cobertura de indexación inicial y warnings de schema.
- [ ] Ajustar copy de titles/descriptions con bajo CTR inicial.
- [ ] Registrar mejoras para iteración siguiente (OG dinámica por propiedad, optimizaciones extra).

---

## Notas operativas para el orquestador

- [ ] Priorizar batches de menor blast radius primero (tipos/queries antes de routing público completo).
- [ ] No mezclar mejoras estéticas con cambios SEO estructurales en la misma tanda.
- [ ] Ante conflicto de alcance, privilegiar estabilidad de rutas y metadata canónica.
- [ ] Mantener trazabilidad fase -> commit -> evidencia para auditoría técnica.
