import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './styles.css'
import App from './App'

const root = document.getElementById('root')!
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />)
} else {
  createRoot(root).render(<App />)
}
