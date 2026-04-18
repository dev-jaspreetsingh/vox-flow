import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* StrictMode is omitted so React 18 dev double-mounting does not run
   FlowBuilder.init twice on the same mount node (the SDK has no teardown API). */
createRoot(document.getElementById('root')!).render(<App />)
