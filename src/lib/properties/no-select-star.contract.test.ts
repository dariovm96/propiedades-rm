import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const CRITICAL_FILES = [
  "src/app/page.tsx",
  "src/app/propiedades/page.tsx",
  "src/app/admin/dashboard/page.tsx",
  "src/lib/properties/public-repo.ts",
]

describe("critical data reads contract", () => {
  it("no usa select('*') en módulos críticos", () => {
    for (const filePath of CRITICAL_FILES) {
      const content = readFileSync(filePath, "utf-8")
      expect(content).not.toMatch(/\.select\(\s*["']\*["']/)
    }
  })
})
