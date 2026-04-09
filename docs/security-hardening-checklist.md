# Security Hardening Operational Checklist — `security-production-hardening`

## Objetivo
Runbook operativo pre-producción y post-deploy para validar controles de hardening de seguridad sin introducir cambios de UI/layout/estilos.

## Scope y guardrails
- ✅ Scope: controles técnicos de seguridad (CI gates, headers, sanitización de errores, rate limiting admin, uploads server-side, excepciones auditables).
- ❌ Fuera de scope: cambios visuales/UI (layout, estilos, componentes, copy, interacción).

## Ownership

| Área | Owner primario | Backup | Evidencia mínima |
|---|---|---|---|
| Security gates CI (`security:audit`, `security:exceptions`, secret scan) | Security Champion / DevOps | Tech Lead Backend | Link a run de workflow `quality` en verde |
| Headers/CSP/HSTS por entorno | Backend Lead | DevOps | Respuestas HTTP con headers esperados |
| Sanitización de errores + logging interno | Backend Lead | Security Champion | Muestra de payload 4xx/5xx sanitizado con `requestId` + log interno correlado |
| Rate limit admin write distribuido | Backend Lead | SRE/DevOps | Evidencia 200/201→429 consistente |
| Upload server-side (authz, MIME, size, firma) | Backend Lead | Security Champion | Prueba de rechazo 403/4xx sin persistencia |
| Evidencia de no-impacto visual | QA / Product | Frontend Lead | Comparativa baseline vs staging sin diferencias intencionales |

## Pre-producción (staging) — checklist obligatorio

### A. Gates de seguridad en CI
- [ ] `npm run security:audit` en verde (0 High/Critical).
- [ ] `npm run security:exceptions` en verde (metadata completa + `expiry` no vencida).
- [ ] Secret scanning en verde en workflow `quality`.

### B. Validación funcional de hardening
- [ ] Headers requeridos presentes en rutas in-scope (CSP, XCTO, Referrer-Policy; HSTS solo prod HTTPS).
- [ ] Errores 4xx/5xx exponen contrato seguro (sin stack/provider/sql/secrets) y contienen `requestId`.
- [ ] Mutaciones admin write: al superar umbral responde `429` sin detalle interno + `Retry-After` coherente.
- [ ] Upload inválido/no autorizado responde rechazo y **no** persiste objeto.

### C. Evidencia de no-impacto visual (scope security-only)
- [ ] Comparar screenshots baseline vs staging en páginas públicas críticas.
- [ ] Comparar screenshots baseline vs staging en rutas admin críticas.
- [ ] Registrar “sin diferencias visuales intencionales” en PR/checklist.

## Post-deploy (producción) — validación operativa
- [ ] Workflow `quality` verde en commit/tag deployado.
- [ ] Smoke de headers en endpoints in-scope de producción.
- [ ] Verificación de errores sanitizados en endpoint de prueba controlado (sin fuga de internals).
- [ ] Confirmar métricas/logs esperados: bloqueos rate limit, rechazos upload y errores sanitizados con trazabilidad.
- [ ] Confirmar evidencia de no-impacto visual (comparación final baseline vs producción).

## Rollback operativo

### Triggers de rollback
- Gate de seguridad bloqueante no resoluble dentro de ventana de release.
- Regresión de seguridad crítica en headers/sanitización/rate limiting/uploads.
- Hallazgo de impacto funcional severo en endpoints críticos admin.

### Pasos de rollback
1. Notificar incidente en canal operativo (`#release`/`#security`) con owner asignado.
2. Revertir a tag/commit estable previo del change `security-production-hardening`.
3. Validar CI mínimo del rollback:
   - `npm run security:audit`
   - `npm run security:exceptions`
   - workflow `quality` en verde
4. Ejecutar smoke técnico rápido en endpoints admin/public definidos por release.
5. Confirmar explícitamente “sin impacto visual/UI” tras rollback.
6. Abrir postmortem con causa raíz, evidencia y plan de remediación.

## Evidencia requerida (adjuntable a PR/verify)
1. Enlace a workflow `quality` exitoso.
2. Salida de `security:audit` y `security:exceptions`.
3. Capturas/respuestas de headers en staging/prod.
4. Ejemplos de payload sanitizado + correlación de `requestId` con log interno.
5. Evidencia de 429 consistente en mutaciones admin.
6. Evidencia de rechazo de uploads inválidos/no autorizados sin persistencia.
7. Capturas baseline vs staging/prod demostrando no-impacto visual.

## Evidencia de cierre (batch apply final)
- Archivo consolidado: `docs/security-hardening-evidence.md`
- Incluye:
  - paridad visual baseline vs hardened en rutas críticas (sin cambios en archivos UI clave),
  - ejecución real de gates de CI (`security:audit`, `security:exceptions`, secret scanning path de workflow para archivos trackeados).

## Criterio de cierre P2-3
Checklist reproducible, ownership explícito y plan de rollback documentado, con confirmación escrita de scope **security-only** y **sin cambios de UI**.
