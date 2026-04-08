# Plan de Remediacion SDD

## 1. Contexto

Este documento define un plan de remediacion **detallado y ejecutable** para resolver hallazgos ya verificados en el repositorio `propiedades-rm`, usando flujo **SDD (Spec Driven Development)**.

### Hallazgos verificados

1. **P0**: Riesgo XSS en JSON-LD por serializacion/inyeccion insegura.
2. **P1**: Logs de desarrollo versionados en git (`.verify-dev.log`, `dev-server.log`) y endurecimiento de `.gitignore`.
3. **P1**: Falta de metadata especifica en `/` y `/propiedades`.
4. **P2**: Falta rate limiting en endpoints admin.
5. **P2**: Inconsistencia en validacion de `SUPABASE_SERVICE_ROLE_KEY` en rutas admin.

---

## 2. Objetivos, alcance y no-alcance

## 2.1 Objetivos

- Eliminar el riesgo XSS asociado a JSON-LD (P0).
- Corregir higiene de repositorio y evitar re-versionado de logs locales (P1).
- Completar metadata SEO critica en rutas clave (`/` y `/propiedades`) (P1).
- Incorporar protecciones baseline de abuso (rate limiting) en superficie admin (P2).
- Unificar y endurecer validacion de `SUPABASE_SERVICE_ROLE_KEY` para rutas admin (P2).
- Ejecutar cambios bajo gobernanza SDD con trazabilidad completa a verificacion.

## 2.2 Alcance

- Codigo y configuracion estrictamente relacionados con los 5 hallazgos listados.
- Artefactos SDD: propuesta, especificacion, diseno tecnico, tareas, verificacion y archivo.
- Pruebas unitarias, integracion, e2e y checks de seguridad orientados a los hallazgos.
- Plan de rollout y rollback controlado.

## 2.3 No-alcance

- Refactors amplios no vinculados a los hallazgos.
- Cambios de arquitectura global no requeridos para la mitigacion.
- Reescritura completa de sistema SEO o sistema de autenticacion.
- Optimizaciones de rendimiento no relacionadas con seguridad/SEO de este plan.

---

## 3. Priorizacion y justificacion de riesgo

| Prioridad | Hallazgo | Justificacion de riesgo | Impacto esperado |
|---|---|---|---|
| P0 | XSS en JSON-LD | Posible inyeccion de payload ejecutable via serializacion insegura; riesgo directo de seguridad y confianza del sitio | Alto en seguridad, compliance y reputacion |
| P1 | Logs en git + `.gitignore` debil | Exposicion accidental de trazas locales/operativas; ruido de repositorio y potencial filtrado de info | Medio en seguridad operativa y gobernanza |
| P1 | Metadata faltante en `/` y `/propiedades` | Cobertura SEO incompleta en rutas de mayor trafico/intencion | Medio en discoverability y CTR organico |
| P2 | Sin rate limiting en admin | Mayor superficie para abuso, scraping o ataque por volumen | Medio-bajo inmediato, alto acumulado |
| P2 | Validacion inconsistente de `SUPABASE_SERVICE_ROLE_KEY` | Comportamiento heterogeneo de seguridad en rutas admin; riesgo de bypass por diferencias de control | Medio en hardening de acceso |

**Orden de ejecucion recomendado:** P0 -> P1 (paralelizable por stream) -> P2.

---

## 4. Plan por fases SDD

## 4.1 Explore

**Entradas**
- Lista de hallazgos verificados (este documento).
- Estado actual de rutas afectadas (`/`, `/propiedades`, admin).
- Configuracion de logging y `.gitignore` actual.

**Actividades**
- Mapear puntos de inyeccion/serializacion JSON-LD.
- Inventariar archivos de log que pueden generarse localmente.
- Relevar metadata actual de rutas objetivo.
- Identificar todos los endpoints admin y controles existentes.
- Detectar variantes actuales de validacion de `SUPABASE_SERVICE_ROLE_KEY`.

**Artefactos esperados**
- Mapa de superficie afectada por hallazgo (codigo + rutas).
- Hipotesis de remediacion por hallazgo con impacto tecnico.

**Criterios de salida**
- Cada hallazgo tiene ubicacion de codigo concreta y estrategia de correccion preliminar.
- Sin ambiguedades sobre alcance tecnico.

## 4.2 Propose

**Entradas**
- Resultado de Explore.

**Actividades**
- Definir estrategia de cambio minima y segura por hallazgo.
- Estimar riesgo de despliegue y orden de implementacion.
- Acordar criterios de exito medibles.

**Artefactos esperados**
- `proposal.md` del cambio con objetivo, alcance, riesgos y plan macro.

**Criterios de salida**
- Aprobacion explicita de propuesta.
- Prioridades P0/P1/P2 congeladas para ejecucion.

## 4.3 Spec

**Entradas**
- Propuesta aprobada.

**Actividades**
- Escribir requisitos funcionales y no funcionales por hallazgo.
- Definir escenarios Given/When/Then (positivo, negativo y edge).
- Fijar criterios verificables de seguridad, SEO y observabilidad.

**Artefactos esperados**
- `spec.md` (delta spec) con requisitos numerados.

**Criterios de salida**
- Todos los hallazgos trazados a al menos un requisito.
- Escenarios testeables definidos sin ambiguedad.

## 4.4 Design

**Entradas**
- Spec aprobada.

**Actividades**
- Disenar cambios tecnicos puntuales:
  - Sanitizacion/serializacion segura para JSON-LD.
  - Politica de exclusiones de logs en `.gitignore`.
  - Estrategia de metadata por ruta (`/`, `/propiedades`).
  - Middleware/guard reutilizable para rate limiting admin.
  - Punto unico de validacion de `SUPABASE_SERVICE_ROLE_KEY`.
- Definir decisiones de rollback por componente.

**Artefactos esperados**
- `design.md` con decisiones, trade-offs y diagrama/logica de flujo.

**Criterios de salida**
- Diseno implementable en tareas pequenas y testeables.
- Riesgos de integracion identificados y mitigados.

## 4.5 Tasks

**Entradas**
- Design aprobado.

**Actividades**
- Descomponer en tareas atomicas por prioridad.
- Agregar criterio de aceptacion y evidencia por tarea.
- Definir dependencias y paralelizacion.

**Artefactos esperados**
- `tasks.md` con checklist ejecutable.

**Criterios de salida**
- Cada tarea mapea a un requisito y a una verificacion concreta.
- Backlog listo para ejecutar en batches.

## 4.6 Apply (en batches)

**Entradas**
- Tasks aprobadas.

**Actividades**
- **Batch 1 (P0):** remediacion XSS JSON-LD + tests de seguridad unitarios/integracion.
- **Batch 2 (P1):** limpieza logs versionados + hardening `.gitignore` + metadata `/` y `/propiedades` + tests SEO.
- **Batch 3 (P2):** rate limiting admin + unificacion validacion `SUPABASE_SERVICE_ROLE_KEY` + tests de seguridad/integracion.
- Mantener cambios pequenos, revisables y revertibles.

**Artefactos esperados**
- Commits por batch con evidencia de pruebas.
- Registro de decisiones tecnicas acotadas.

**Criterios de salida**
- Todas las tareas del batch completadas y verificadas localmente (sin build).
- Sin regresiones en pruebas existentes relevantes.

## 4.7 Verify

**Entradas**
- Implementacion completa de batches.
- Evidencia de tests.

**Actividades**
- Verificar cumplimiento requisito por requisito.
- Ejecutar matriz de pruebas definidas (unit/integration/e2e/security checks).
- Confirmar no reaparicion de logs versionados.
- Validar metadata efectiva en rutas objetivo.
- Validar bloqueo por rate limiting y consistencia de validacion de key.

**Artefactos esperados**
- `verify.md` con resultado por requisito, evidencia y gaps (si existen).

**Criterios de salida**
- 100% requisitos en estado pass o explicitamente diferidos con justificacion aprobada.

## 4.8 Archive

**Entradas**
- Verify aprobado.

**Actividades**
- Consolidar aprendizaje y decisiones finales.
- Sincronizar artefactos delta al historial principal SDD.
- Cerrar change con estado final y pendientes (si aplica).

**Artefactos esperados**
- Registro archivado del cambio en repositorio SDD.

**Criterios de salida**
- Cambio cerrado con trazabilidad completa y recuperable.

---

## 5. Requisitos funcionales y no funcionales

## 5.1 Requisitos funcionales (RF)

- **RF-01 (P0):** El renderizado de JSON-LD debe impedir inyeccion de payload activo mediante serializacion segura y escape adecuado.
- **RF-02 (P1):** Los archivos de log de desarrollo (`.verify-dev.log`, `dev-server.log` y equivalentes) no deben quedar versionados.
- **RF-03 (P1):** Las rutas `/` y `/propiedades` deben exponer metadata especifica y completa segun estrategia SEO definida.
- **RF-04 (P2):** Endpoints admin deben aplicar rate limiting consistente por origen/identidad definida.
- **RF-05 (P2):** Todas las rutas admin deben reutilizar una validacion uniforme de `SUPABASE_SERVICE_ROLE_KEY`.

## 5.2 Requisitos no funcionales (RNF)

- **RNF-SEC-01 (Seguridad):** No introducir nuevos vectores XSS ni degradar controles de acceso admin.
- **RNF-SEC-02 (Seguridad):** Rate limiting debe responder con codigo y mensaje consistente bajo exceso de requests.
- **RNF-SEO-01 (SEO):** Metadata de `/` y `/propiedades` debe ser estable, coherente y verificable en tests.
- **RNF-OBS-01 (Observabilidad):** Eventos de rechazo por rate limiting y fallos de validacion admin deben quedar trazables en logging existente (sin versionar logs locales).
- **RNF-RB-01 (Rollback):** Cada batch debe poder revertirse de forma independiente sin dejar estado de seguridad parcial.
- **RNF-QUAL-01 (Calidad):** Cobertura de pruebas para flujos criticos modificados debe mantenerse o mejorar.

---

## 6. Matriz de trazabilidad

| Hallazgo | Requerimiento(s) | Tarea(s) | Verificacion |
|---|---|---|---|
| H-01 P0 XSS JSON-LD | RF-01, RNF-SEC-01 | T1 identificar puntos JSON-LD; T2 aplicar serializacion segura; T3 tests payload malicioso | V1 unit test de escape; V2 integration test de output no ejecutable; V3 regression check |
| H-02 P1 Logs en git | RF-02, RNF-OBS-01 | T4 remover logs versionados; T5 endurecer `.gitignore`; T6 test/chequeo de estado git para logs | V4 verificacion de tracking nulo de logs; V5 control de patrones en `.gitignore` |
| H-03 P1 Metadata faltante | RF-03, RNF-SEO-01 | T7 definir metadata por ruta; T8 implementar `/`; T9 implementar `/propiedades`; T10 tests de metadata | V6 tests unit/integration de metadata esperada |
| H-04 P2 Sin rate limiting admin | RF-04, RNF-SEC-02, RNF-OBS-01 | T11 disenar politica limite; T12 integrar middleware/guard; T13 tests de limite y respuesta | V7 integration tests 200->429; V8 evidencia de logging de rechazo |
| H-05 P2 Validacion key inconsistente | RF-05, RNF-SEC-01 | T14 centralizar validacion; T15 reemplazar validaciones ad-hoc; T16 tests de autorizacion admin | V9 tests negativos sin key/incorrecta; V10 tests positivos con key valida |

---

## 7. Estrategia de testing (sin ejecutar build)

## 7.1 Unit tests

- Validacion de utilidades de serializacion/escape JSON-LD con payloads maliciosos.
- Validacion de helper central de `SUPABASE_SERVICE_ROLE_KEY` (casos validos/invalidos).
- Validacion de generacion de metadata por ruta.

## 7.2 Integration tests

- Rutas que emiten JSON-LD: confirmar ausencia de inyeccion ejecutable en output final.
- Endpoints admin: confirmar comportamiento de rate limiting y validacion uniforme de key.
- Verificar headers/respuestas esperadas en errores de seguridad.

## 7.3 E2E checks

- Navegacion a `/` y `/propiedades` con validacion de metadata renderizada.
- Flujo admin basico: acceso valido, rechazo por key invalida, rechazo por exceso de requests.

## 7.4 Security checks

- Casos de prueba de payload XSS conocidos aplicados a campos serializados en JSON-LD.
- Pruebas de bypass simples sobre rate limiting (rafaga controlada y ventana temporal).
- Validacion de consistencia de codigos HTTP y mensajes de error para no filtrar detalles sensibles.

## 7.5 Reglas operativas

- Ejecutar solo pruebas (unit/integration/e2e/security checks) necesarias por batch.
- **No ejecutar build** como parte de este plan.
- Registrar evidencia por test suite para fase Verify.

---

## 8. Plan de rollout y rollback

## 8.1 Rollout

- Despliegue progresivo por batch:
  1. Batch 1 (P0) primero, con verificacion de seguridad inmediata.
  2. Batch 2 (P1) luego, verificando higiene git + metadata.
  3. Batch 3 (P2) ultimo, monitoreando rechazos 429 y autorizacion admin.
- Ventanas de observacion entre batches para detectar regresiones.

## 8.2 Rollback

- Rollback por batch (no global) ante fallo critico.
- Criterios de rollback inmediato:
  - Regresion de seguridad (XSS, bypass admin).
  - Bloqueo indebido masivo por rate limiting.
  - Rotura funcional severa en rutas `/` o `/propiedades`.
- Mantener changelog de decisiones de rollback y causa raiz.

---

## 9. Riesgos, dependencias y mitigaciones

| Tipo | Item | Riesgo | Mitigacion |
|---|---|---|---|
| Riesgo tecnico | Cambio JSON-LD | Escape insuficiente o doble escape | Definir contrato claro de serializacion + tests de payload reales |
| Riesgo tecnico | Rate limiting | Falsos positivos sobre trafico legitimo | Parametrizar limites y validar en integration/e2e antes de cerrar |
| Riesgo tecnico | Validacion key | Rutas legacy quedan fuera del helper comun | Inventario completo de endpoints admin en Explore + checklist en Tasks |
| Dependencia | Convenciones SEO | Definicion exacta de metadata esperada | Congelar criterios en Spec antes de Apply |
| Dependencia | Pipeline pruebas | Suites disponibles sin build | Ejecutar suites existentes por alcance, generar evidencia utilizable en Verify |
| Riesgo operativo | Logs locales | Reaparicion de archivos no ignorados | Endurecer `.gitignore` + chequeo recurrente en Verify |

---

## 10. Definicion de Done global

Se considera completado cuando:

- Los 5 hallazgos estan cerrados con evidencia verificable.
- Todos los requisitos RF/RNF asociados pasan en Verify.
- Existe trazabilidad completa hallazgo -> requisito -> tarea -> verificacion.
- Rollout por batches ejecutado sin incidentes criticos abiertos.
- Artefactos SDD archivados y recuperables.

---

## 11. Checklist final ejecutable

- [ ] Explore completado con mapa tecnico por hallazgo.
- [ ] Propose aprobado con riesgos y orden de ejecucion.
- [ ] Spec aprobada con requisitos y escenarios testeables.
- [ ] Design aprobado con decisiones tecnicas y rollback.
- [ ] Tasks aprobadas con dependencia y evidencia esperada.
- [ ] Apply Batch 1 (P0) completado y verificado.
- [ ] Apply Batch 2 (P1) completado y verificado.
- [ ] Apply Batch 3 (P2) completado y verificado.
- [ ] Verify completado con matriz de resultados.
- [ ] Archive completado y cambio cerrado.

---

## 12. Nota de ejecucion

Este plan esta acotado estrictamente a los hallazgos listados y debe ejecutarse sin introducir cambios fuera de alcance, preservando foco en seguridad, SEO y robustez operativa con trazabilidad SDD end-to-end.
