# Entity Contract Template

## 1) Data Contracts (`src/types/<entity>.ts`)

```ts
export type <EntityRow> = {
  id: string
}

export type <EditableEntity> = {
  id?: string
}

export type <EntityInsertPayload> = {
}

export type <EntityUpdatePayload> = {
}

export type <EntityListResponse> = {
  items: <EntityRow>[]
}

export type <EntityItemResponse> = {
  item: <EntityRow>
}

export type <EntityCreateRequest> = {
}

export type <EntityUpdateRequest> = {
  id?: string
}

export type <EntityDeleteRequest> = {
  id?: string
}
```

## 2) Form Mapper (`src/lib/<entity>-form.ts`)

```ts
import { <EditableEntity>, <EntityInsertPayload> } from "@/types/<entity>"

export function to<Entity>InsertPayload(form: <EditableEntity>): <EntityInsertPayload> {
  return {
  }
}
```

## 3) Client Layer (`src/lib/<entity>-client.ts`)

```ts
import {
  <EditableEntity>,
  <EntityCreateRequest>,
  <EntityDeleteRequest>,
  <EntityListResponse>,
  <EntityUpdateRequest>,
} from "@/types/<entity>"

async function assertResponseOk(response: Response) {
  if (response.ok) return

  let message = "Request failed"
  try {
    const body = (await response.json()) as { error?: string }
    if (body?.error) message = body.error
  } catch {}

  throw new Error(message)
}

export async function fetch<Entity>List(resourceId: string): Promise<<EditableEntity>[]> {
  const response = await fetch(`/admin/<resource>/${resourceId}/<entity>`, {
    method: "GET",
    credentials: "include",
  })

  await assertResponseOk(response)

  const body = (await response.json()) as <EntityListResponse>
  return (body.items ?? []).map((item) => ({ id: item.id }))
}

export async function create<Entity>Items(resourceId: string, items: <EditableEntity>[]) {
  for (const item of items) {
    const body: <EntityCreateRequest> = {}

    const response = await fetch(`/admin/<resource>/${resourceId}/<entity>`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })

    await assertResponseOk(response)
  }
}

export async function update<Entity>Item(resourceId: string, body: <EntityUpdateRequest>) {
  const response = await fetch(`/admin/<resource>/${resourceId}/<entity>`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })

  await assertResponseOk(response)
}

export async function delete<Entity>Item(resourceId: string, body: <EntityDeleteRequest>) {
  const response = await fetch(`/admin/<resource>/${resourceId}/<entity>`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })

  await assertResponseOk(response)
}
```

## 4) Route Handler Pattern (`src/app/admin/<resource>/[id]/<entity>/route.ts`)

```ts
import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { createRouteSupabaseClient } from "@/lib/server-supabase"
import {
  <EntityCreateRequest>,
  <EntityDeleteRequest>,
  <EntityInsertPayload>,
  <EntityRow>,
  <EntityUpdatePayload>,
  <EntityUpdateRequest>,
} from "@/types/<entity>"

type RouteCtx = { params: { id: string } | Promise<{ id: string }> }

function getServiceRoleSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function requireAdminRouteAccess() {
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)

  if ("response" in guard) {
    return { errorResponse: guard.response }
  }

  const adminSupabase = getServiceRoleSupabase()
  if (!adminSupabase) {
    return {
      errorResponse: jsonError(
        ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
        ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
      ),
    }
  }

  return { adminSupabase }
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id } = (await ctx.params) as { id: string }
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) return access.errorResponse

  const { data, error } = await access.adminSupabase
    .from("<entity_table>")
    .select("*")
    .returns<<EntityRow>[]>()
    .eq("<foreign_key>", id)

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  return jsonSuccess({ items: data ?? [] })
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id } = (await ctx.params) as { id: string }
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) return access.errorResponse

  const payload = (await req.json()) as <EntityCreateRequest>

  const insertPayload: <EntityInsertPayload> = {
  }

  const { data, error } = await access.adminSupabase
    .from("<entity_table>")
    .insert(insertPayload)
    .select("*")
    .returns<<EntityRow>[]>()
    .single()

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  return jsonSuccess({ item: data })
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { id } = (await ctx.params) as { id: string }
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) return access.errorResponse

  const payload = (await req.json()) as <EntityUpdateRequest>

  if (!payload.id) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const updatePayload: <EntityUpdatePayload> = {
  }

  const { data, error } = await access.adminSupabase
    .from("<entity_table>")
    .update(updatePayload)
    .eq("id", payload.id)
    .eq("<foreign_key>", id)
    .select("*")
    .returns<<EntityRow>[]>()

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data || data.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
  }

  return jsonSuccess({ item: data[0] })
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { id } = (await ctx.params) as { id: string }
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) return access.errorResponse

  const payload = (await req.json()) as <EntityDeleteRequest>

  if (!payload.id) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const { data, error } = await access.adminSupabase
    .from("<entity_table>")
    .delete()
    .select("id")
    .eq("id", payload.id)
    .eq("<foreign_key>", id)

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data || data.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
  }

  return jsonSuccess({ deleted: data })
}
```

## 5) Quick Checklist

- Add entity file in `src/types`.
- Add typed form mapper in `src/lib`.
- Add typed client helper in `src/lib`.
- Add admin route guarded with `requireAdminUser`.
- Use `.returns<T>()` in Supabase reads.
- Build typed payload variables before `.insert()` / `.update()`.
- Keep request/response contracts in `src/types`.
