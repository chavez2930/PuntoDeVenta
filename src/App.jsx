import { useEffect } from 'react'
import { POSProvider, usePOS } from './context/POSContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Toasts from './components/Toasts'

function AppContent() {
  const { state } = usePOS()

  // Aplicar tema al <html> siempre, incluso en Login
  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }, [state.theme])

  if (!state.isAuthenticated) {
    return <Login />
  }

  return <Layout />
}

export default function App() {
  return (
    <POSProvider>
      <AppContent />
      <Toasts />
    </POSProvider>
  )
}