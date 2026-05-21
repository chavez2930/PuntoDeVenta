import { useEffect } from 'react'
import { usePOS } from '../context/POSContext'
import Sidebar from './Sidebar'
import Header from './Header'
import Caja from './views/Caja'
import Dashboard from './views/Dashboard'
import Productos from './views/Productos'
import Historial from './views/Historial'
import Inventario from './views/Inventario'
import Configuracion from './views/Configuracion'
import Reportes from './views/Reportes'

const views = {
  caja: Caja,
  dashboard: Dashboard,
  productos: Productos,
  historial: Historial,
  inventario: Inventario,
  reportes: Reportes,
  configuracion: Configuracion
}

export default function Layout() {
  const { state } = usePOS()
  const ActiveView = views[state.activeView] || Caja

  // Aplicar clase al <html> para que afecte TODO incluyendo Login
  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }, [state.theme])

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <ActiveView />
        </main>
      </div>

      {/* Mobile menu overlay */}
      {state.mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => state.dispatch?.({ type: 'CLOSE_MOBILE_MENU' })}
        />
      )}
    </div>
  )
}