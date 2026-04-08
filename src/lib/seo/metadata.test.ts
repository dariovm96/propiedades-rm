import { describe, expect, it } from "vitest"
import { buildBaseMetadata, buildHomePageMetadata, buildPropertiesPageMetadata } from "@/lib/seo/metadata"
import { promises as fs } from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { fileURLToPath } from "node:url"
import os from "node:os"

const execFileAsync = promisify(execFile)
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(currentDir, "../../..")

async function runGitStatus(cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", ["status", "--short"], {
    cwd,
  })

  return stdout.replaceAll("\\", "/")
}

async function createGitIgnoreFixtureRepo(): Promise<string> {
  const fixtureRepoRoot = await fs.mkdtemp(path.join(os.tmpdir(), "metadata-gitignore-fixture-"))
  const gitIgnoreContent = await fs.readFile(path.join(projectRoot, ".gitignore"), "utf8")

  await fs.writeFile(path.join(fixtureRepoRoot, ".gitignore"), gitIgnoreContent, "utf8")
  await execFileAsync("git", ["init"], { cwd: fixtureRepoRoot })

  const sourcePath = path.join(fixtureRepoRoot, "src", "visible-change.ts")
  await fs.mkdir(path.dirname(sourcePath), { recursive: true })
  await fs.writeFile(sourcePath, "export const visibleChange = 1\n", "utf8")
  await execFileAsync("git", ["add", "src/visible-change.ts"], { cwd: fixtureRepoRoot })
  await fs.writeFile(sourcePath, "export const visibleChange = 2\n", "utf8")

  await fs.writeFile(path.join(fixtureRepoRoot, ".verify-dev.log"), "temporary verify log\n", "utf8")
  await fs.writeFile(path.join(fixtureRepoRoot, "dev-server.log"), "temporary dev log\n", "utf8")

  return fixtureRepoRoot
}

describe("SEO metadata por ruta", () => {
  it("genera metadata específica para home con canonical y OG propios de /", () => {
    const metadata = buildHomePageMetadata()

    expect(metadata.title).toBe("Propiedades RM | Compra y arriendo sin intermediarios")
    expect(metadata.description).toBe(
      "Descubre propiedades en venta y arriendo en la Región Metropolitana con contacto directo y asesoría personalizada.",
    )
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/")
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/")
  })

  it("genera metadata específica para /propiedades con canonical estable sin query params", () => {
    const metadata = buildPropertiesPageMetadata()

    expect(metadata.title).toBe("Propiedades disponibles | Propiedades RM")
    expect(metadata.description).toBe(
      "Explora propiedades disponibles para compra o arriendo, con información clara y contacto directo con propietarios.",
    )
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/propiedades")
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/propiedades")
    expect(String(metadata.alternates?.canonical)).not.toContain("?")
  })

  it("falla aceptación cuando metadata requerida para /propiedades está incompleta", () => {
    const metadata = buildPropertiesPageMetadata()

    const canonical = metadata.alternates?.canonical
    const ogUrl = metadata.openGraph?.url

    const missingRequiredMetadata = !metadata.title || !metadata.description || !canonical || !ogUrl

    expect(missingRequiredMetadata).toBe(false)
  })

  it("normaliza metadatos vacíos con fallback no vacío y canonical absoluto", () => {
    const metadata = buildBaseMetadata({
      title: "   ",
      description: "",
      canonicalPath: "propiedades",
    })

    expect(metadata.title).toBe("Propiedades RM")
    expect(metadata.description).toBe(
      "Descubre propiedades en venta y arriendo en la Región Metropolitana con contacto directo y asesoría personalizada."
    )
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/propiedades")
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/propiedades")
    expect(metadata.twitter?.title).toBe("Propiedades RM")
  })

  it("hace canonical determinístico aun cuando canonicalPath llega absoluto", () => {
    const metadata = buildBaseMetadata({
      title: "Título",
      description: "Descripción",
      canonicalPath: "https://example.com/propiedades?page=2",
    })

    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/propiedades?page=2")
    expect(String(metadata.alternates?.canonical)).not.toContain("example.com")
  })
})

describe("Higiene de logs en gitignore", () => {
  it("ignora .verify-dev.log y dev-server.log en git status", async () => {
    const fixtureRepoRoot = await createGitIgnoreFixtureRepo()

    try {
      const status = await runGitStatus(fixtureRepoRoot)

      expect(status).not.toContain(".verify-dev.log")
      expect(status).not.toContain("dev-server.log")
    } finally {
      await fs.rm(fixtureRepoRoot, { recursive: true, force: true })
    }
  })

  it("mantiene visibles cambios de código en git status", async () => {
    const fixtureRepoRoot = await createGitIgnoreFixtureRepo()

    try {
      const status = await runGitStatus(fixtureRepoRoot)

      expect(status).toContain("src/visible-change.ts")
    } finally {
      await fs.rm(fixtureRepoRoot, { recursive: true, force: true })
    }
  })
})
