import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')
// Keep the server's useful first paint through Suspense and route failures.
// This is our own index.html markup, never content supplied by a visitor.
const fallbackContent = root.innerHTML

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App fallbackContent={fallbackContent} />
  </React.StrictMode>,
)
