import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlowBuilder } from 'voxtelesys-flow'
import {
  type FlowWidgetGroup,
  flowWidgetGroupsFromEnv,
  mountFlowWidgetLibraryFilter,
} from '../lib/flowWidgetLibraryFilter'

const CANVAS_MOUNT_ID = 'vox-flow-canvas'

function readConfig() {
  const apiKey = import.meta.env.VITE_VOX_API_KEY?.trim() ?? ''
  const flowGuid = import.meta.env.VITE_VOX_FLOW_GUID?.trim() ?? ''
  const companyName = import.meta.env.VITE_VOX_COMPANY_NAME?.trim()
  const companyLogo = import.meta.env.VITE_VOX_COMPANY_LOGO?.trim()
  return { apiKey, flowGuid, companyName, companyLogo }
}

type FlowCanvasProps = {
  /** When set (e.g. from routing), overrides `VITE_VOX_FLOW_GUID`. */
  flowGuid?: string
  /** Called when the Canvas back control is used. */
  onBack?: () => void
  /**
   * Left sidebar widget groups to keep visible (`voice`, `messaging`, `rcs`, `tools`, `control`).
   * When omitted, uses `VITE_VOX_FLOW_LIBRARY_GROUPS` if set.
   */
  widgetLibraryGroups?: FlowWidgetGroup[] | null
}

export function FlowCanvas({
  flowGuid: flowGuidProp,
  onBack,
  widgetLibraryGroups,
}: FlowCanvasProps) {
  const [error, setError] = useState<string | null>(null)
  const { apiKey, flowGuid: flowGuidEnv, companyName, companyLogo } = readConfig()
  const flowGuid = (flowGuidProp?.trim() || flowGuidEnv).trim()
  const onBackRef = useRef(onBack)

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!apiKey || !flowGuid) return

    let cancelled = false
    /* Init Canvas when credentials / flow change; clear prior error on retry. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before (re)initializing FlowBuilder
    setError(null)

    const allowedGroups =
      widgetLibraryGroups && widgetLibraryGroups.length > 0
        ? widgetLibraryGroups
        : flowWidgetGroupsFromEnv()
    const removeWidgetFilter = mountFlowWidgetLibraryFilter(allowedGroups)

    void (async () => {
      try {
        await FlowBuilder.init(CANVAS_MOUNT_ID, {
          apiKey,
          flowGuid,
          onBack: () =>
            (onBackRef.current ?? (() => window.history.back()))(),
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
      removeWidgetFilter()
    }
  }, [apiKey, flowGuid, companyName, companyLogo, widgetLibraryGroups])

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
# VITE_VOX_COMPANY_LOGO=https://example.com/logo.png
# VITE_VOX_FLOW_LIBRARY_GROUPS=voice,control`}
        </pre>
        <p className="flow-canvas__hint">
          Open the <Link to="/">flow list</Link> to pick a flow, or set{' '}
          <code>VITE_VOX_FLOW_GUID</code>. Create keys in the{' '}
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
