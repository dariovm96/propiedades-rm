# Prompt SDD — Implementación SEO para Propiedades RM

---

## Instrucciones para el agente

Eres un agente de desarrollo experto en Next.js (App Router), TypeScript y SEO técnico.
Vas a implementar mejoras de SEO en un proyecto existente siguiendo **Spec-Driven Development (SDD)**:
antes de escribir cualquier código, debes **leer y auditar** los archivos relevantes del proyecto,
entender el patrón actual, y luego proponer e implementar los cambios de forma quirúrgica —
**sin romper lo que ya funciona**, sin inventar abstracciones nuevas innecesarias,
y respetando todos los patrones arquitectónicos existentes.

---

## Contexto del proyecto

**Nombre**: Propiedades RM  
**Stack**: Next.js App Router · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Storage) · Vercel  
**Renderizado**: RSC por defecto, ISR con `revalidate = 60` en páginas públicas, Client Components solo para interacciones  
**Rutas públicas relevantes**:
- `/` → homepage (RSC, ISR)
- `/propiedades` → listado paginado (RSC, ISR)
- `/propiedades/[slug]` → detalle de propiedad (RSC, ISR)

**Modelo de datos relevante** (tabla `properties` en Supabase):
```
id          UUID
title       string        — título de la propiedad
slug        string        — ya existe, generado automáticamente, URL-friendly
description text
price       number        — en CLP
area_m2     number
location_text string      — texto libre de ubicación
status      enum          — available | sold | rented
highlighted boolean
images      string[]      — paths en Supabase Storage
created_at  timestamp
```

**Foco geográfico del negocio**:
- Principal: Melipilla (Región Metropolitana)
- Secundario: La Estrella (Región del Libertador Bernardo O'Higgins / 6ª Región)
- Tipos de propiedades: terrenos, parcelas, casas (venta y arriendo)

---

## Fase 0 — Auditoría obligatoria antes de cualquier cambio

> ⚠️ Esta fase es **no negociable**. No escribas ni modifiques ningún archivo hasta completarla.

Lee y analiza los siguientes archivos en este orden:

1. `src/app/layout.tsx` — ¿Existe metadata estática? ¿Cómo está estructurado el root layout?
2. `src/app/page.tsx` — ¿Qué metadata tiene? ¿Cómo consulta Supabase?
3. `src/app/propiedades/page.tsx` — ¿Tiene metadata? ¿Cómo recibe parámetros?
4. `src/app/propiedades/[slug]/page.tsx` — ¿Tiene `generateMetadata`? ¿Qué campos consulta de Supabase?
5. `next.config.*` — ¿Hay configuración de imágenes, redirects, headers?
6. `public/` — ¿Existe `robots.txt` o `sitemap.xml`?
7. `src/app/sitemap.ts` o `src/app/robots.ts` — ¿Existen estos archivos?
8. `src/lib/server-supabase.ts` — Patrón de cliente servidor para replicarlo correctamente
9. `src/types/property.ts` — Tipo `Property` completo para no inventar campos

Luego de la auditoría, genera un **reporte breve** con:
- Qué metadata existe actualmente y dónde
- Si hay `sitemap.ts` / `robots.ts` o están como archivos estáticos en `public/`
- Qué campos de `Property` están disponibles para construir metadata dinámica
- Cualquier conflicto o riesgo detectado antes de proceder

**Solo después de ese reporte, procede con las fases siguientes.**

---

## Fase 1 — Metadata dinámica por propiedad

**Archivo objetivo**: `src/app/propiedades/[slug]/page.tsx`

**Tarea**: Implementar `generateMetadata` dinámico si no existe o mejorarlo si es estático.

**Especificación**:

```typescript
// Ejemplo de output esperado para una propiedad real:
// title: "Terreno 5.000 m² en venta – Melipilla | Propiedades RM"
// description: "Terreno de 5.000 m² disponible en Melipilla, Región Metropolitana. Precio: $45.000.000 CLP. Contáctanos para más información."
// og:image: primera imagen de la propiedad (URL pública de Supabase Storage)
// og:type: "website" (no hay tipo específico para real estate en OG básico)
// canonical: https://[dominio]/propiedades/[slug]
```

**Reglas de implementación**:
- Usa el mismo cliente Supabase servidor que usa el resto de la página (`server-supabase.ts`), no crees uno nuevo
- Si la propiedad no existe (slug inválido), retorna metadata de fallback sin lanzar error
- El título debe incluir: tipo inferido del título + área m² si existe + "en venta/arriendo" según status + ciudad desde `location_text` + "| Propiedades RM"
- La descripción debe ser generada, no hardcodeada — usa campos reales de la propiedad
- `og:image` debe usar la primera URL de `images[]` convertida a URL pública (revisa cómo lo hace el resto del proyecto en `storage-helpers.ts`)
- No dupliques la consulta a Supabase si `generateMetadata` y `page` la hacen por separado — evalúa si el patrón actual ya lo resuelve o si conviene extraer una función `getPropertyBySlug()`
- Respeta el `revalidate = 60` que ya existe en la página

---

## Fase 2 — Metadata de páginas de listado y home

**Archivos objetivo**: `src/app/page.tsx` y `src/app/propiedades/page.tsx`

**Tarea**: Revisar metadata existente y mejorarla si es genérica o inexistente.

**Especificación**:

**Homepage** (`/`):
```
title: "Propiedades RM – Terrenos, Parcelas y Casas en Melipilla"
description: "Encuentra terrenos, parcelas y casas en venta y arriendo en Melipilla y La Estrella. Propiedades seleccionadas en la Región Metropolitana y 6ª Región."
```

**Listado** (`/propiedades`):
```
title: "Propiedades en venta y arriendo – Melipilla | Propiedades RM"
description: "Explora nuestro catálogo de terrenos, parcelas y casas disponibles en Melipilla, La Estrella y comunas cercanas."
```

**Reglas**:
- Si ya existe metadata en estas páginas, compara con la especificación y solo modifica si es más genérica o incorrecta
- No toques nada más en estos archivos — solo el bloque de `metadata` o `generateMetadata`
- Mantén el mismo patrón que ya usa el proyecto (export const metadata o generateMetadata según corresponda)

---

## Fase 3 — sitemap.xml dinámico

**Archivo a crear**: `src/app/sitemap.ts`  
**Verificar primero**: si existe `public/sitemap.xml` estático, este archivo lo reemplaza y el estático debe eliminarse

**Especificación**:

```typescript
// Debe retornar:
// - URL raíz: /
// - /propiedades
// - Una entrada por cada propiedad con status = 'available', usando su slug
// - Prioridades: / = 1.0, /propiedades = 0.8, cada propiedad = 0.6
// - changeFrequency: 'weekly' para raíz y listado, 'monthly' para propiedades individuales
// - lastModified: created_at de la propiedad para entradas individuales
```

**Reglas**:
- Consulta solo propiedades con `status = 'available'` — no indexar las vendidas/arrendadas
- Usa el cliente Supabase servidor, mismo patrón que el resto del proyecto
- El dominio base debe venir de una variable de entorno `NEXT_PUBLIC_SITE_URL` — si no existe, agrégala al `.env.example` y documenta que debe ser añadida. No hardcodees el dominio.
- No uses `revalidate` aquí — Next.js maneja el sitemap por su cuenta

---

## Fase 4 — robots.txt

**Archivo a crear**: `src/app/robots.ts`  
**Verificar primero**: si existe `public/robots.txt`, este lo reemplaza y el estático debe eliminarse

**Especificación**:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login
Disallow: /admin/dashboard
Sitemap: https://[NEXT_PUBLIC_SITE_URL]/sitemap.xml
```

**Reglas**:
- Usa el helper `MetadataRoute.Robots` de Next.js, no generes texto plano
- El dominio debe venir de `NEXT_PUBLIC_SITE_URL` igual que el sitemap

---

## Fase 5 — Schema.org en fichas de propiedad

**Archivo objetivo**: `src/app/propiedades/[slug]/page.tsx`

**Tarea**: Agregar JSON-LD con tipo `RealEstateListing` en el `<head>` de cada ficha.

**Especificación del JSON-LD**:

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "[title de la propiedad]",
  "description": "[description]",
  "url": "https://[dominio]/propiedades/[slug]",
  "price": "[price] CLP",
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": "[area_m2]",
    "unitCode": "MTK"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[extraído de location_text]",
    "addressCountry": "CL"
  },
  "image": ["[URLs públicas de las imágenes]"]
}
```

**Reglas**:
- Inyéctalo con `<script type="application/ld+json">` dentro del componente RSC de la página, no en un Client Component
- No hagas una segunda consulta a Supabase — usa los datos que la página ya cargó
- Si `area_m2` es null, omite el campo `floorSize` en lugar de enviar null
- Si `images` está vacío, omite `image`
- No instales librerías externas para esto — es JSON serializado simple

---

## Fase 6 — Verificación final

Después de implementar todas las fases, ejecuta esta checklist y reporta el resultado:

- [ ] `generateMetadata` en `/propiedades/[slug]` retorna título y descripción únicos por propiedad
- [ ] `og:image` apunta a una URL pública válida de Supabase Storage
- [ ] `/sitemap.xml` es accesible y lista solo propiedades disponibles
- [ ] `/robots.txt` bloquea `/admin/*` y referencia el sitemap
- [ ] JSON-LD presente en el `<head>` de páginas de propiedad (verificar con "Ver código fuente")
- [ ] No hay consultas duplicadas a Supabase innecesarias
- [ ] No se rompió ningún comportamiento existente (auth, imágenes, paginación, ISR)
- [ ] `NEXT_PUBLIC_SITE_URL` documentada en `.env.example`

---

## Restricciones globales

1. **No instales dependencias nuevas** — todo lo que se necesita está disponible en Next.js 14+ y el proyecto actual
2. **No cambies el schema de Supabase** — trabaja con los campos existentes
3. **No modifiques componentes Client** — los cambios son en RSC y archivos de configuración
4. **No toques la lógica de admin** — ningún archivo bajo `src/app/admin/` debe ser modificado
5. **Respeta el patrón de clientes Supabase** — usa `server-supabase.ts` para consultas en servidor, nunca `supabase.ts` (cliente público) en RSC
6. **Un archivo a la vez** — implementa, muestra el diff o el archivo completo, y espera confirmación antes de pasar al siguiente
