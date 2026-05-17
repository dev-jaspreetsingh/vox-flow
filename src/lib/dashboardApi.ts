/**
 * Voxtelesys Dashboard API — flows
 * @see https://developer.voxtelesys.com/apis/dashboard/
 * @see https://developer.voxtelesys.com/apis/authorization/
 */

const DEFAULT_PROD_BASE =
  'https://dashboardapi.voxtelesys.net/api/v1'

export type FlowSummary = {
  flowGuid: string
  name?: string
  description?: string
}

export class DashboardApiError extends Error {
  readonly status: number
  readonly bodyText?: string

  constructor(message: string, status: number, bodyText?: string) {
    super(message)
    this.name = 'DashboardApiError'
    this.status = status
    this.bodyText = bodyText
  }
}

function dashboardBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_VOX_DASHBOARD_API_BASE?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (import.meta.env.DEV) return '/vox-dashboard-api'
  return DEFAULT_PROD_BASE
}

function bearerHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

function extractGuid(obj: Record<string, unknown>): string | null {
  for (const k of ['flowGuid', 'flow_guid', 'guid', 'id', 'flowId', 'flow_id']) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return null
}

function extractName(obj: Record<string, unknown>): string | undefined {
  for (const k of ['name', 'flowName', 'flow_name', 'title']) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function extractDescription(obj: Record<string, unknown>): string | undefined {
  for (const k of ['description', 'flowDescription', 'flow_description']) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function payloadAsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const key of ['data', 'flows', 'items', 'results', 'result']) {
      const v = o[key]
      if (Array.isArray(v)) return v
    }
  }
  return []
}

function normalizeFlowRecord(raw: unknown): FlowSummary | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const flowGuid = extractGuid(o)
  if (!flowGuid) return null
  return {
    flowGuid,
    name: extractName(o),
    description: extractDescription(o),
  }
}

export async function listFlows(apiToken: string): Promise<FlowSummary[]> {
  const res = await fetch(`${dashboardBaseUrl()}/flows`, {
    method: 'GET',
    headers: bearerHeaders(apiToken),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new DashboardApiError(
      `Failed to list flows (${res.status})`,
      res.status,
      text,
    )
  }
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : []
  } catch {
    throw new DashboardApiError('Invalid JSON listing flows', res.status, text)
  }
  const rows = payloadAsArray(parsed)
  const out: FlowSummary[] = []
  for (const row of rows) {
    const f = normalizeFlowRecord(row)
    if (f) out.push(f)
  }
  return out
}

function parseCreatedGuid(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null
  const o = json as Record<string, unknown>
  const top = extractGuid(o)
  if (top) return top
  const data = o.data
  if (data && typeof data === 'object') {
    return extractGuid(data as Record<string, unknown>)
  }
  return null
}

export type CreateFlowInput = {
  title: string
  description?: string
  /**
   * Working document for the flow.
   * Omit so the API initializes a blank template (start widget only).
   */
  definition?: Record<string, unknown>
}

/** When sending a custom definition, ensure `elements` exists so validation passes. */
function normalizeFlowDefinition(
  definition: Record<string, unknown>,
): Record<string, unknown> {
  const base = { ...definition }
  if (!Array.isArray(base.elements)) {
    base.elements = []
  }
  return base
}

export async function createFlow(
  apiToken: string,
  input: CreateFlowInput,
): Promise<string> {
  const body: Record<string, unknown> = {
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
  }
  if (input.definition !== undefined && input.definition !== null) {
    body.definition = normalizeFlowDefinition(input.definition)
  }

  const res = await fetch(`${dashboardBaseUrl()}/flows`, {
    method: 'POST',
    headers: bearerHeaders(apiToken),
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new DashboardApiError(
      `Failed to create flow (${res.status})`,
      res.status,
      text,
    )
  }
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    throw new DashboardApiError('Invalid JSON after create flow', res.status, text)
  }
  const guid = parseCreatedGuid(parsed)
  if (!guid) {
    throw new DashboardApiError(
      'Create flow succeeded but response had no flow id/guid',
      res.status,
      text,
    )
  }
  return guid
}
