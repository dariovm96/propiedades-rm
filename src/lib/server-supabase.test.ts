import { beforeEach, describe, expect, it, vi } from "vitest"

describe("requireServiceRoleClient", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key"
  })

  it("falla de forma explícita y registra evento cuando falta SUPABASE_SERVICE_ROLE_KEY", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    const { requireServiceRoleClient } = await import("@/lib/server-supabase")

    expect(() => requireServiceRoleClient()).toThrow("server misconfiguration")
    expect(warnSpy).toHaveBeenCalledWith(
      "admin_service_role_missing",
      expect.objectContaining({
        reason: "SUPABASE_SERVICE_ROLE_KEY not configured",
      })
    )
  })

  it("retorna cliente service-role cuando el entorno está configurado", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"

    const { requireServiceRoleClient } = await import("@/lib/server-supabase")
    const client = requireServiceRoleClient()

    expect(client).toBeTruthy()
    expect(typeof client.from).toBe("function")
  })
})
