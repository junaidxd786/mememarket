import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

console.log('🚀 MemeMarket starting...')

try {
  const rootElement = document.getElementById('root')
  console.log('Root element found:', !!rootElement)

  if (!rootElement) {
    throw new Error('Root element not found')
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )

  console.log('✅ MemeMarket rendered successfully')
} catch (error) {
  console.error('❌ MemeMarket failed to start:', error)

  // Fallback error display
  document.body.innerHTML = `
    <div style="color: red; font-family: monospace; padding: 20px;">
      <h1>MemeMarket Error</h1>
      <p>Failed to start the application. Check console for details.</p>
      <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `
}
