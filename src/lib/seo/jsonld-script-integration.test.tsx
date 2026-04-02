import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { safeJsonLdScriptContent, toJsonLdScriptContent } from "@/lib/seo/jsonld"

describe("JSON-LD script integration", () => {
  it("mantiene integración en rutas con dangerouslySetInnerHTML y helper compartido", () => {
    const layoutFile = readFileSync("src/app/layout.tsx", "utf-8")
    const canonicalDetailFile = readFileSync("src/app/[tipo]/[...segments]/page.tsx", "utf-8")

    expect(layoutFile).toMatch(/safeJsonLdScriptContent/)
    expect(layoutFile).toMatch(/<script type="application\/ld\+json" dangerouslySetInnerHTML=/)
    expect(canonicalDetailFile).toMatch(/safeJsonLdScriptContent/)
    expect(canonicalDetailFile).toMatch(/<script type="application\/ld\+json" dangerouslySetInnerHTML=/)
  })

  it("genera markup ld+json válido sin secuencias peligrosas ejecutables", () => {
    const payload = {
      description: "</script><script>alert('xss')</script>",
      text: "A&B<C>D",
    }

    const __html = toJsonLdScriptContent(payload)
    const html = renderToStaticMarkup(<script type="application/ld+json" dangerouslySetInnerHTML={{ __html }} />)

    expect(html).toContain("type=\"application/ld+json\"")
    expect(html).not.toContain("</script><script>alert('xss')</script>")
    expect(html).toContain("\\u003c/script\\u003e\\u003cscript\\u003ealert('xss')\\u003c/script\\u003e")
    expect(JSON.parse(__html)).toEqual(payload)
  })

  it("omite script cuando json-ld es inválido", () => {
    const safe = safeJsonLdScriptContent({ foo: "bar" })
    expect(safe).toBeNull()
  })
})
