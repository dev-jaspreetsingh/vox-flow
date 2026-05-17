import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  type FlowSummary,
  listFlows,
  createFlow,
  DashboardApiError,
} from '../lib/dashboardApi'

function readApiKey(): string {
  return import.meta.env.VITE_VOX_API_KEY?.trim() ?? ''
}

export function FlowListPage() {
  const navigate = useNavigate()
  const apiKey = readApiKey()
  const [flows, setFlows] = useState<FlowSummary[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError(null)
    try {
      const list = await listFlows(apiKey)
      setFlows(list)
    } catch (e) {
      const msg =
        e instanceof DashboardApiError
          ? `${e.message}${e.bodyText ? `: ${e.bodyText}` : ''}`
          : e instanceof Error
            ? e.message
            : 'Could not load flows'
      setError(msg)
      setFlows(null)
    } finally {
      setLoading(false)
    }
  }, [apiKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load list on mount / API key change
    void load()
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!apiKey || !createTitle.trim() || creating) return
    setCreating(true)
    setError(null)
    try {
      const guid = await createFlow(apiKey, {
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
      })
      setCreateTitle('')
      setCreateDescription('')
      await load()
      navigate(`/flow/${encodeURIComponent(guid)}`)
    } catch (err) {
      const msg =
        err instanceof DashboardApiError
          ? `${err.message}${err.bodyText ? `: ${err.bodyText}` : ''}`
          : err instanceof Error
            ? err.message
            : 'Could not create flow'
      setError(msg)
    } finally {
      setCreating(false)
    }
  }

  if (!apiKey) {
    return (
      <div className="flow-dashboard flow-dashboard--setup">
        <h1>Flows</h1>
        <p>
          Set <code>VITE_VOX_API_KEY</code> in <code>.env</code> (Bearer token from the{' '}
          <a
            href="https://portal.voxtelesys.net/api-keys"
            target="_blank"
            rel="noreferrer"
          >
            portal
          </a>
          ). Then restart <code>npm run dev</code>.
        </p>
        <p className="flow-dashboard__doclink">
          <a
            href="https://developer.voxtelesys.com/apis/dashboard/"
            target="_blank"
            rel="noreferrer"
          >
            Dashboard API overview
          </a>
          {' · '}
          <a
            href="https://developer.voxtelesys.com/apis/authorization"
            target="_blank"
            rel="noreferrer"
          >
            Authorization
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="flow-dashboard">
      <header className="flow-dashboard__header">
        <h1>Flows</h1>
        <div className="flow-dashboard__actions">
          <button
            type="button"
            className="flow-dashboard__btn flow-dashboard__btn--ghost"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <p className="flow-dashboard__hint">
        Lists and creates flows via{' '}
        <code>GET /flows</code> and <code>POST /flows</code> on the{' '}
        <a
          href="https://developer.voxtelesys.com/apis/dashboard/"
          target="_blank"
          rel="noreferrer"
        >
          Dashboard API
        </a>
        . In dev, requests use the Vite proxy at <code>/vox-dashboard-api</code> to avoid CORS.
      </p>

      {error ? (
        <div className="flow-dashboard__error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="flow-dashboard__panel">
        <h2>Create flow</h2>
        <form className="flow-dashboard__form" onSubmit={onCreate}>
          <label className="flow-dashboard__field">
            <span>Title</span>
            <input
              type="text"
              name="flowTitle"
              autoComplete="off"
              value={createTitle}
              onChange={(ev) => setCreateTitle(ev.target.value)}
              placeholder="My inbound flow"
              required
            />
          </label>
          <label className="flow-dashboard__field">
            <span>Description (optional)</span>
            <input
              type="text"
              name="description"
              autoComplete="off"
              value={createDescription}
              onChange={(ev) => setCreateDescription(ev.target.value)}
              placeholder="Handled by sales queue"
            />
          </label>
          <button
            type="submit"
            className="flow-dashboard__btn flow-dashboard__btn--primary"
            disabled={creating || !createTitle.trim()}
          >
            {creating ? 'Creating…' : 'Create and open in Canvas'}
          </button>
        </form>
      </section>

      <section className="flow-dashboard__panel">
        <h2>Your flows</h2>
        {loading && flows === null ? (
          <p className="flow-dashboard__muted">Loading…</p>
        ) : !flows?.length ? (
          <p className="flow-dashboard__muted">No flows returned yet.</p>
        ) : (
          <ul className="flow-dashboard__list">
            {flows.map((f) => (
              <li key={f.flowGuid} className="flow-dashboard__list-item">
                <div className="flow-dashboard__list-main">
                  <span className="flow-dashboard__list-title">
                    {f.name ?? 'Untitled flow'}
                  </span>
                  <code className="flow-dashboard__guid">{f.flowGuid}</code>
                </div>
                <Link
                  className="flow-dashboard__btn flow-dashboard__btn--sm"
                  to={`/flow/${encodeURIComponent(f.flowGuid)}`}
                >
                  Edit in Canvas
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
