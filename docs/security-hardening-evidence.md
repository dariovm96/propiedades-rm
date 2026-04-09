# Security Hardening Evidence Log — `security-production-hardening`

## Objetivo
Cerrar gaps de evidencia del verify final en dos frentes:
1) paridad visual baseline vs hardened en rutas críticas, y
2) ejecución real E2E de gates CI (`security:audit`, `security:exceptions`, secret scanning en path de workflow cuando aplica).

## Fecha / entorno
- Fecha de ejecución: 2026-04-03
- Repo: `propiedades-rm`
- Branch local: `seo-refactor`
- Workflow de referencia: `.github/workflows/quality.yml` (job `security-gates`)

---

## 1) Evidencia explícita de paridad visual baseline vs hardened

### Método reproducible (sin tocar UI)
Se validó que los archivos fuente de rutas visuales críticas y estilos globales **no cambiaron** entre baseline (contenido versionado en `HEAD`) y hardened (working tree actual):

```bash
for f in \
  "src/app/page.tsx" \
  "src/app/propiedades/page.tsx" \
  "src/app/propiedades/[slug]/page.tsx" \
  "src/app/admin/login/page.tsx" \
  "src/app/admin/page.tsx" \
  "src/app/admin/dashboard/page.tsx" \
  "src/app/admin/propiedades/nueva/page.tsx" \
  "src/app/admin/propiedades/[id]/editar/page.tsx" \
  "src/app/globals.css"; do
  head_hash=$(git rev-parse "HEAD:$f" 2>/dev/null || echo "MISSING")
  work_hash=$(git hash-object "$f" 2>/dev/null || echo "MISSING")
  if [ "$head_hash" = "$work_hash" ]; then status="MATCH"; else status="DIFF"; fi
  printf "%s|%s|%s|%s\n" "$f" "$head_hash" "$work_hash" "$status"
done
```

### Resultado
Todos los artefactos críticos de UI/layout/estilo dieron `MATCH`:

| Archivo crítico | Baseline (`HEAD`) | Hardened (working tree) | Estado |
|---|---|---|---|
| `src/app/page.tsx` | `aa113370679297f7340d2118adca5587d51481ab` | `aa113370679297f7340d2118adca5587d51481ab` | ✅ MATCH |
| `src/app/propiedades/page.tsx` | `6659338edd441fcd394842964b65aaac7a190c7a` | `6659338edd441fcd394842964b65aaac7a190c7a` | ✅ MATCH |
| `src/app/propiedades/[slug]/page.tsx` | `71a4840c647cdaf78c71eb4d0bc6224fdcb3a559` | `71a4840c647cdaf78c71eb4d0bc6224fdcb3a559` | ✅ MATCH |
| `src/app/admin/login/page.tsx` | `83badca44df97a86c8f63330c3b830cac75e6488` | `83badca44df97a86c8f63330c3b830cac75e6488` | ✅ MATCH |
| `src/app/admin/page.tsx` | `44202326b78fe765ab0ee359995d4d110b5b0a63` | `44202326b78fe765ab0ee359995d4d110b5b0a63` | ✅ MATCH |
| `src/app/admin/dashboard/page.tsx` | `892d92143797dd4faa0c2678cd0b61cf0144ae8f` | `892d92143797dd4faa0c2678cd0b61cf0144ae8f` | ✅ MATCH |
| `src/app/admin/propiedades/nueva/page.tsx` | `68a54a7a73c85d75fb7c80374f92e0abb7c7b0b0` | `68a54a7a73c85d75fb7c80374f92e0abb7c7b0b0` | ✅ MATCH |
| `src/app/admin/propiedades/[id]/editar/page.tsx` | `1e5e619b4b50dd137a8f9c3f7610ae89cacae4e1` | `1e5e619b4b50dd137a8f9c3f7610ae89cacae4e1` | ✅ MATCH |
| `src/app/globals.css` | `7066ab3422538960c0800f9769470ed26e2546c9` | `7066ab3422538960c0800f9769470ed26e2546c9` | ✅ MATCH |

Conclusión: no hay evidencia de cambios en artefactos visuales críticos dentro del batch de hardening/evidencia.

---

## 2) Evidencia E2E de ejecución real de gates CI

### Gate A — Dependency audit (`security:audit`)
Comando ejecutado:

```bash
npm run security:audit
```

Resultado real:

```text
> npm audit --omit=dev --audit-level=high
found 0 vulnerabilities
```

### Gate B — Security exceptions (`security:exceptions`)
Comando ejecutado:

```bash
npm run security:exceptions
```

Resultado real:

```text
✅ .github/security-exceptions.yaml validation passed (1 exception entries).
```

### Gate C — Secret scanning (workflow-path)
El workflow usa `gitleaks/gitleaks-action@v2` sobre archivos trackeados (contexto git). Para reproducir localmente el mismo path de escaneo se ejecutó:

```bash
"/c/Users/daril/go/bin/gitleaks.exe" detect --source="C:\Users\daril\OneDrive\Documentos\Projects\propiedades-rm" --redact --report-format json --report-path "tmp-gitleaks-git-report.json"
```

Resultado real:

```text
12 commits scanned.
no leaks found
```

Reporte generado:
- `tmp-gitleaks-git-report.json` → `[]`

> Nota de trazabilidad: también se ejecutó un scan filesystem (`--no-git`) que detectó secretos en `.env.local` local. Esto **no contradice** el gate de workflow porque `.env.local` no forma parte del path de archivos trackeados del PR en GitHub Actions.

---

## Mapeo contra workflow `quality.yml`

Job: `security-gates`

| Step workflow | Implementación local ejecutada | Evidencia |
|---|---|---|
| `Dependency audit (block High/Critical)` | `npm run security:audit` | ✅ pass, 0 vulnerabilities |
| `Validate security exceptions (owner/evidence/expiry)` | `npm run security:exceptions` | ✅ pass |
| `Secret scanning (tracked files)` | `gitleaks detect --source=<repo> --redact` | ✅ pass, no leaks |

## Conclusión de cierre
- Gap 1 (paridad visual): **cerrado** con evidencia explícita reproducible de inmutabilidad en rutas críticas/UI global.
- Gap 2 (gates CI E2E): **cerrado** con ejecución real local equivalente al path del workflow para los 3 gates.
