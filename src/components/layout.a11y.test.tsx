import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

function read(filePath: string): string {
  return readFileSync(filePath, "utf-8")
}

describe("layout semantics a11y", () => {
  it("declara landmarks y navegación accesible en Header", () => {
    const content = read("src/components/Header.tsx")

    expect(content).toMatch(/<header\b/)
    expect(content).toMatch(/<nav[^>]+aria-label="Navegación principal"/)
    expect(content).toMatch(/id="mobile-navigation"/)
    expect(content).toMatch(/aria-controls="mobile-navigation"/)
    expect(content).toMatch(/aria-expanded=\{isOpen\}/)
  })

  it("declara landmark de footer y enlaces con nombre accesible", () => {
    const content = read("src/components/Footer.tsx")

    expect(content).toMatch(/<footer\b/)
    expect(content).toMatch(/aria-label=\{`Llamar al \$\{CONTACT_PHONE_DISPLAY\}`\}/)
    expect(content).toMatch(/aria-label="Contactar por WhatsApp"/)
  })

  it("marca iconografía decorativa como aria-hidden", () => {
    const whatsappIcon = read("src/components/icons/WhatsAppIcon.tsx")
    const contactAction = read("src/components/ContactActionButton.tsx")

    expect(whatsappIcon).toMatch(/aria-hidden="true"/)
    expect(contactAction).toMatch(/aria-hidden="true"/)
  })
})
