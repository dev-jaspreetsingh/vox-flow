import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FlowCanvas } from './FlowCanvas'

export function FlowEditorPage() {
  const { flowGuid } = useParams<{ flowGuid: string }>()
  const navigate = useNavigate()

  if (!flowGuid?.trim()) {
    return <Navigate to="/" replace />
  }

  return (
    <FlowCanvas
      flowGuid={flowGuid.trim()}
      onBack={() => void navigate('/')}
    />
  )
}
