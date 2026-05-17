import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FlowEditorPage } from './components/FlowEditorPage'
import { FlowListPage } from './components/FlowListPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<FlowListPage />} />
          <Route path="/flow/:flowGuid" element={<FlowEditorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
