import { describe, expect, it } from "vitest"
import { safeJsonLdScriptContent, toJsonLdScriptContent } from "@/lib/seo/jsonld"

describe("toJsonLdScriptContent", () => {
  it("neutraliza payload XSS con cierre de script y mantiene JSON parseable", () => {
    const input = {
      "@context": "https://schema.org",
      description: "</script><script>alert(1)</script>",
    }

    const serialized = toJsonLdScriptContent(input)

    expect(serialized).not.toContain("</script><script>")
    expect(serialized).toContain("\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e")
    expect(JSON.parse(serialized)).toEqual(input)
  })

  it("escapa &, <, >, U+2028 y U+2029 sin romper parseo", () => {
    const input = {
      text: "A&B<C>D",
      lineSeparator: "uno\u2028dos",
      paragraphSeparator: "tres\u2029cuatro",
    }

    const serialized = toJsonLdScriptContent(input)

    expect(serialized).toContain("\\u0026")
    expect(serialized).toContain("\\u003c")
    expect(serialized).toContain("\\u003e")
    expect(serialized).toContain("\\u2028")
    expect(serialized).toContain("\\u2029")
    expect(JSON.parse(serialized)).toEqual(input)
  })

  it("omite json-ld inválido cuando falta @context o @type", () => {
    expect(safeJsonLdScriptContent({ "@context": "https://schema.org" })).toBeNull()
    expect(safeJsonLdScriptContent({ "@type": "Organization" })).toBeNull()
    expect(safeJsonLdScriptContent("invalid")).toBeNull()
  })

  it("serializa json-ld válido cuando contiene contrato mínimo", () => {
    const safe = safeJsonLdScriptContent({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Propiedades RM",
    })

    expect(safe).toBeTruthy()
    expect(JSON.parse(String(safe))).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Propiedades RM",
    })
  })
})
