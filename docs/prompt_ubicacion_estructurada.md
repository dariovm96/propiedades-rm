# Prompt SDD — Migración a ubicación estructurada (comuna, región, sector)

---

## Instrucciones para el agente

Eres un agente de desarrollo experto en Next.js (App Router), TypeScript y Supabase.
Vas a extender el modelo de datos y la UI de un proyecto existente para soportar ubicación geográfica estructurada.

Este proyecto **ya tiene SEO implementado**: `generateMetadata` dinámico, `sitemap.ts`, `robots.ts` y JSON-LD con `RealEstateListing` en fichas de propiedad. Tu trabajo es **mejorar esa base**, no reemplazarla. Cada cambio debe ser aditivo y quirúrgico.

Sigue **Spec-Driven Development (SDD)**: audita primero, propón cambios, implementa solo después de confirmación, un archivo a la vez.

---

## Contexto del proyecto

**Stack**: Next.js App Router · TypeScript · Tailwind CSS · Supabase (Postgres) · Vercel  
**Mapa**: Leaflet (ya integrado en el detalle de propiedad)  

**Modelo actual relevante** (tabla `properties`):
```
location_text   string    — texto libre, ej: "cerca del centro de Melipilla, camino pavimentado"
slug            string    — generado automáticamente, URL-friendly
```

**Foco geográfico del negocio**:
- Principal: Melipilla (Región Metropolitana)
- Secundario: La Estrella (6ª Región / Región del Libertador Bernardo O'Higgins)
- Tipos: terrenos, parcelas, casas — venta y arriendo

**SEO ya implementado (no tocar salvo para mejorar)**:
- `src/app/propiedades/[slug]/page.tsx` — tiene `generateMetadata` y JSON-LD con `RealEstateListing`
- `src/app/sitemap.ts` — dinámico, consulta propiedades `available`
- `src/app/robots.ts` — bloquea `/admin/*`, referencia sitemap
- `src/app/page.tsx` y `src/app/propiedades/page.tsx` — metadata estática mejorada

---

## Fase 0 — Auditoría obligatoria antes de cualquier cambio

> ⚠️ No escribas ni modifiques ningún archivo hasta completar esta fase.

Lee y analiza en este orden:

1. `src/types/property.ts` — tipo `Property` completo y `PropertyFormPayload`
2. `src/app/propiedades/[slug]/page.tsx` — cómo usa `location_text` en metadata, JSON-LD y el mapa Leaflet
3. `src/app/propiedades/page.tsx` — cómo filtra o muestra ubicación en el listado
4. `src/app/page.tsx` — si usa `location_text` en homepage
5. `src/components/PropertyCard.tsx` — cómo muestra la ubicación en tarjetas
6. `src/components/PropertyFormFields.tsx` — campo actual de ubicación en el formulario admin
7. `src/lib/property-form.ts` — tipos de formulario y helpers relevantes
8. `src/app/sitemap.ts` — si usa `location_text` para algo
9. `src/app/admin/propiedades/nueva/page.tsx` y `src/app/admin/propiedades/[id]/editar/` — flujo de creación/edición

Luego genera un **reporte de auditoría** con:
- Todos los lugares donde `location_text` es leído o renderizado
- Cómo está siendo usado en el JSON-LD actual (`addressLocality`, etc.)
- Si el mapa Leaflet usa `location_text` para geocodificar o tiene coordenadas separadas
- Qué campos existen en `PropertyFormPayload` actualmente
- Riesgos o dependencias a considerar antes de proceder

**Solo después del reporte, procede con las fases siguientes.**

---

## Fase 1 — Migración de base de datos en Supabase

**Tarea**: Agregar 3 columnas nuevas a la tabla `properties`. Todas nullable para no romper registros existentes.

**Especificación SQL**:

```sql
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS comuna TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT;

COMMENT ON COLUMN properties.comuna IS 'Comuna administrativa, ej: Melipilla, La Estrella';
COMMENT ON COLUMN properties.region IS 'Región de Chile, ej: Región Metropolitana';
COMMENT ON COLUMN properties.sector IS 'Referencia libre de ubicación dentro de la comuna, ej: sector Lo Chacón, camino a Pomaire';
```

**Reglas**:
- `location_text` **no se elimina** — pasa a ser el campo narrativo/descriptivo de la ubicación
- Las 3 columnas son `nullable` — las propiedades existentes quedan con null y siguen funcionando
- No hay valor por defecto — el admin los llenará manualmente al crear/editar
- Presenta el SQL para que el usuario lo ejecute en el dashboard de Supabase. No lo ejecutes tú directamente.
- Después de confirmar que el SQL fue ejecutado, continúa con las siguientes fases.

---

## Fase 2 — Actualización de tipos TypeScript

**Archivos objetivo**: `src/types/property.ts`

**Tarea**: Agregar los 3 campos nuevos al tipo `Property` y a `PropertyFormPayload` (o el tipo equivalente que uses para formularios).

**Especificación**:

```typescript
// En el tipo Property (datos que vienen de Supabase):
comuna?: string | null
region?: string | null
sector?: string | null

// En PropertyFormPayload (datos del formulario admin):
comuna: string        // string vacío si no se llenó
region: string
sector: string
```

**Reglas**:
- Usa `string | null` en `Property` porque son columnas nullable en Supabase
- Usa `string` (no null) en el payload del formulario — el form siempre envía string, puede ser vacío
- No cambies ningún otro campo existente — solo agrega los nuevos
- Si hay otros tipos derivados de `Property` en el proyecto, agrégalos también (lo detectarás en la auditoría)

---

## Fase 3 — Formulario admin

**Archivos objetivo**: `src/components/PropertyFormFields.tsx` y `src/lib/property-form.ts`

**Tarea**: Agregar los 3 campos nuevos al formulario de creación/edición de propiedades.

**Especificación de UI**:

```
Sección "Ubicación" (agregar debajo del campo location_text actual):

[Comuna *]           → select con opciones fijas (ver abajo) + opción "Otra"
[Región]             → select con opciones fijas, idealmente autocompletado según comuna
[Sector / Referencia] → input text libre, placeholder: "ej: sector Lo Chacón, camino a Pomaire"
```

**Opciones para `comuna`** (las que cubre el negocio, en este orden):
```
Melipilla
La Estrella
Otra
```

**Opciones para `region`** (autocompletar según comuna seleccionada):
```
Melipilla       → Región Metropolitana de Santiago
La Estrella     → Región del Libertador Bernardo O'Higgins
Otra            → campo texto libre
```

**Reglas**:
- `location_text` se mantiene — cambia su label a "Descripción de ubicación" y su placeholder a algo como "ej: a 5 min del centro, camino pavimentado, portón azul"
- `comuna` y `region` son selects, no inputs libres, para garantizar consistencia ortográfica (crítico para SEO)
- Cuando el usuario selecciona una comuna conocida, el campo `region` debe autocompletarse automáticamente pero seguir siendo editable
- `sector` es input libre — es el único campo narrativo nuevo
- Todos son opcionales en el formulario (no romper creación de propiedades existentes)
- Respeta el estilo visual y los componentes de formulario que ya existen en `PropertyFormFields.tsx` — no importes librerías nuevas de UI
- Si `property-form.ts` tiene valores iniciales (initialValues o similar), agrega los 3 campos con string vacío

---

## Fase 4 — API route de actualización

**Archivo objetivo**: `src/app/admin/propiedades/[id]/route.ts` (PATCH handler)

**Tarea**: Asegurarse de que los 3 campos nuevos se incluyen en el payload que se envía a Supabase al editar una propiedad.

**Reglas**:
- Audita el PATCH handler actual para entender qué campos lee del body
- Agrega `comuna`, `region`, `sector` a los campos que se persisten
- No cambies la lógica de autenticación, validación de tipos MIME ni ningún otro comportamiento existente
- Si el handler usa una lista explícita de campos permitidos (whitelist), agrégalos ahí
- Si el handler hace un spread o pasa el body completo, verifica que los tipos coincidan

---

## Fase 5 — Mejora del SEO existente con los nuevos campos

**Archivos objetivo**: `src/app/propiedades/[slug]/page.tsx`

**Tarea**: Mejorar `generateMetadata` y el JSON-LD para usar `comuna` y `region` cuando están disponibles, mantener fallback a `location_text` cuando no.

**Especificación de metadata mejorada**:

```typescript
// Título — con campos estructurados:
// "Terreno 5.000 m² en venta – Melipilla | Propiedades RM"

// Título — sin campos estructurados (fallback actual):
// "Terreno 5.000 m² en venta – [location_text truncado] | Propiedades RM"

// Descripción — con campos estructurados:
// "Terreno de 5.000 m² disponible en Melipilla, Región Metropolitana. Sector Lo Chacón. Precio: $45.000.000 CLP."

// Descripción — sin campos estructurados (fallback):
// comportamiento actual sin cambios
```

**Especificación del JSON-LD mejorado**:

```json
{
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[comuna si existe, si no: location_text]",
    "addressRegion": "[region si existe, si no: omitir el campo]",
    "addressCountry": "CL"
  }
}
```

**Reglas**:
- Lógica de fallback obligatoria: si `comuna` es null o vacío, usar `location_text` como antes — nunca dejar metadata vacía
- No hagas una consulta adicional a Supabase — los campos nuevos ya vienen en el mismo `select *` o en el query existente (verifica en auditoría)
- Si el query actual tiene campos explícitos en el `.select()`, agrega `comuna`, `region`, `sector` ahí
- No cambies `revalidate`, la estructura de la página, ni los componentes visuales

---

## Fase 6 — Visualización en tarjetas y detalle

**Archivos objetivo**: `src/components/PropertyCard.tsx` y la sección de ubicación en `src/app/propiedades/[slug]/page.tsx`

**Tarea**: Mostrar `comuna` en las tarjetas de propiedad y `sector` en el detalle, con fallback a `location_text`.

**Especificación**:

```
PropertyCard:
- Si tiene comuna → mostrar "Melipilla" (con ícono de pin si ya existe uno)
- Si no tiene comuna → mostrar location_text como antes (sin cambios)

Detalle de propiedad (/propiedades/[slug]):
- Si tiene comuna y region → mostrar "Melipilla · Región Metropolitana"
- Si tiene sector → mostrar debajo: "Sector: Lo Chacón"
- location_text sigue mostrándose como descripción narrativa de la ubicación
- El mapa Leaflet no cambia — sigue usando las coordenadas o geocodificación actual
```

**Reglas**:
- Cambios mínimos — solo la parte de ubicación, nada más en estos componentes
- Fallback siempre presente — una propiedad sin `comuna` debe verse exactamente igual que hoy
- No introduzcas lógica condicional compleja — un ternario simple es suficiente

---

## Fase 7 — Verificación final

Después de implementar todas las fases, ejecuta esta checklist y reporta:

- [ ] Las 3 columnas existen en Supabase y son nullable
- [ ] El tipo `Property` en TypeScript incluye `comuna`, `region`, `sector`
- [ ] El formulario admin muestra los 3 campos nuevos con autocompletado de región según comuna
- [ ] Al crear/editar una propiedad y guardar, los 3 campos se persisten en Supabase
- [ ] Las propiedades existentes (sin los campos nuevos) siguen mostrándose correctamente
- [ ] `generateMetadata` usa `comuna` cuando existe y hace fallback a `location_text`
- [ ] El JSON-LD tiene `addressLocality` con `comuna` real cuando existe
- [ ] `PropertyCard` muestra la comuna si existe, `location_text` si no
- [ ] El detalle de propiedad muestra commune + región + sector cuando existen
- [ ] El mapa Leaflet no fue modificado
- [ ] Ningún archivo de `/admin/` fue modificado salvo el PATCH handler de propiedades

---

## Restricciones globales

1. **`location_text` no se elimina ni se depreca** — es el campo narrativo, complementario a los nuevos
2. **Todas las columnas nuevas son opcionales** — cero propiedades existentes deben romperse
3. **No instales dependencias nuevas** — ni para selects, ni para geocodificación, ni para nada
4. **No cambies el schema de highlights** — no está relacionado con esta tarea
5. **No toques autenticación, RLS ni Service Role Key** — fuera de scope
6. **Respeta los clientes Supabase existentes** — `server-supabase.ts` en servidor, `supabaseClient.ts` en Client Components
7. **Un archivo a la vez** — muestra el archivo completo o el diff, espera confirmación antes de continuar
8. **El SQL de migración lo ejecuta el usuario** — preséntalo claramente y espera confirmación explícita antes de continuar con las fases de código
