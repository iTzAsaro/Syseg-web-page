import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Punto de entrada principal de la aplicación React
createRoot(document.getElementById('root')).render(
  // StrictMode ayuda a detectar problemas potenciales en la aplicación
  <StrictMode>
    <App />
  </StrictMode>,
)
