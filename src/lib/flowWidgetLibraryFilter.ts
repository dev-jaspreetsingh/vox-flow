/**
 * Canvas (vast-flow-builder) does not expose widget-library filters on `FlowBuilder.init`.
 * Groups are fixed in the remote bundle; we can only hide sidebar sections by targeting
 * each group’s icon class (e.g. `FlowBuilder__tools-icon`).
 *
 * Requires a browser that supports CSS `:has()` (current Chrome, Firefox, Safari).
 */

export const FLOW_WIDGET_GROUPS = [
  'voice',
  'messaging',
  'rcs',
  'tools',
  'control',
] as const

export type FlowWidgetGroup = (typeof FLOW_WIDGET_GROUPS)[number]

const GROUP_SET = new Set<string>(FLOW_WIDGET_GROUPS)

function parseList(raw: string | undefined): FlowWidgetGroup[] | null {
  if (!raw?.trim()) return null
  const out: FlowWidgetGroup[] = []
  for (const part of raw.split(',')) {
    const k = part.trim().toLowerCase()
    if (GROUP_SET.has(k)) out.push(k as FlowWidgetGroup)
  }
  return out.length ? out : null
}

/** Reads `VITE_VOX_FLOW_LIBRARY_GROUPS` (comma-separated, e.g. `voice,control`). */
export function flowWidgetGroupsFromEnv(): FlowWidgetGroup[] | null {
  return parseList(import.meta.env.VITE_VOX_FLOW_LIBRARY_GROUPS)
}

function groupsToHide(allowed: readonly FlowWidgetGroup[]): FlowWidgetGroup[] {
  const allow = new Set(allowed)
  return FLOW_WIDGET_GROUPS.filter((g) => !allow.has(g))
}

const STYLE_ID = 'vox-flow-widget-library-filter'

/**
 * Injects rules to hide non-allowed widget library sections. Call before `FlowBuilder.init`.
 * Returns a disposer that removes the stylesheet (run on unmount / flow change).
 */
export function mountFlowWidgetLibraryFilter(
  allowed: FlowWidgetGroup[] | null | undefined,
): () => void {
  if (!allowed?.length) return () => {}

  const hide = groupsToHide(allowed)
  if (!hide.length) return () => {}

  document.getElementById(STYLE_ID)?.remove()

  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = hide
    .map(
      (type) =>
        `.FlowBuilder__left-sidebar-tabs .FlowBuilder__flex.FlowBuilder__flex-col:has(.FlowBuilder__${type}-icon){display:none!important}`,
    )
    .join('')

  document.head.appendChild(el)
  return () => {
    el.remove()
  }
}
