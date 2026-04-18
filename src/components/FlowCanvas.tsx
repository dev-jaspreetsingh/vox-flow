import { useEffect, useState } from 'react'
import { FlowBuilder } from 'voxtelesys-flow'

const CANVAS_MOUNT_ID = 'vox-flow-canvas'

function readConfig() {
  const apiKey = import.meta.env.VITE_VOX_API_KEY?.trim() ?? ''
  const flowGuid = import.meta.env.VITE_VOX_FLOW_GUID?.trim() ?? ''
  const companyName = import.meta.env.VITE_VOX_COMPANY_NAME?.trim()
  const companyLogo = import.meta.env.VITE_VOX_COMPANY_LOGO?.trim()
  return { apiKey, flowGuid, companyName, companyLogo }
}

export function FlowCanvas() {
  const [error, setError] = useState<string | null>(null)
  const { apiKey, flowGuid, companyName, companyLogo } = readConfig()

  useEffect(() => {
    if (!apiKey || !flowGuid) return

    let cancelled = false
    setError(null)

    void (async () => {
      try {
        await FlowBuilder.init(CANVAS_MOUNT_ID, {
          apiKey,
          flowGuid,
          onBack: () => window.history.back(),
          ...(companyName ? { companyName } : {}),
          ...(companyLogo ? { companyLogo } : {}),
          styling: {
            primaryColor: '#7ac142',
            leftSidebarWidth: '400px',
            defaultFontSize: '1rem',
          },
        })
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load Canvas')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiKey, flowGuid, companyName, companyLogo])

  if (!apiKey || !flowGuid) {
    return (
      <div className="flow-canvas flow-canvas--setup">
        <h1>Voxtelesys Canvas</h1>
        <p>
          Add your credentials to a <code>.env</code> file in the project root:
        </p>
        <pre className="flow-canvas__env">
          {`VITE_VOX_API_KEY=your_api_key
VITE_VOX_FLOW_GUID=your_flow_guid

# optional
# VITE_VOX_COMPANY_NAME=Example Co
# VITE_VOX_COMPANY_LOGO=https://example.com/logo.png`}
        </pre>
        <p className="flow-canvas__hint">
          Create keys and flows in the{' '}
          <a
            href="https://portal.voxtelesys.net/"
            target="_blank"
            rel="noreferrer"
          >
            Voxtelesys portal
          </a>
          . Then run <code>npm run dev</code> again.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flow-canvas flow-canvas--error" role="alert">
        <h1>Canvas could not start</h1>
        <p>{error}</p>
      </div>
    )
  }

  return <div id={CANVAS_MOUNT_ID} className="flow-canvas flow-canvas--mount" />
}
