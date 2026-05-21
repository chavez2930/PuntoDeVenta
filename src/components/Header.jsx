import { usePOS } from '../context/POSContext'
import { Menu, Bell, LogOut, User, ChevronDown, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { state, dispatch, getRole, getLowStockProducts, addToast } = usePOS()
  const [showUserMenu, setShowUserMenu]       = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef(null)
  const notifRef    = useRef(null)

  const role             = getRole(state.user?.rol_id)
  const lowStockProducts = getLowStockProducts()
  const isDark           = state.theme === 'dark'

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false)
      if (notifRef.current   && !notifRef.current.contains(event.target))    setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout      = () => { dispatch({ type: 'LOGOUT' }); addToast('Sesión cerrada correctamente', 'info') }
  const handleToggleTheme = () => dispatch({ type: 'TOGGLE_THEME' })

  const viewTitles = {
    caja:         'Punto de Venta',
    dashboard:    'Dashboard',
    productos:    'Gestión de Productos',
    historial:    'Historial de Ventas',
    inventario:   'Control de Inventario',
    configuracion:'Configuración'
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">{viewTitles[state.activeView] || 'POS System'}</h2>
          <p className="text-xs text-muted hidden sm:block">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Theme toggle */}
        <button
          onClick={handleToggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-2xl animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-white">Notificaciones</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <div key={product.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-surface-light transition-colors">
                      <p className="text-sm text-white font-medium">{product.nombre}</p>
                      <p className="text-xs text-warning">Stock bajo: {product.stock} / {product.stock_minimo} mínimo</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted">Sin notificaciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-light transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold">
              {state.user?.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white">{state.user?.nombre}</p>
              <p className="text-xs text-muted">{role?.nombre}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-medium text-white">{state.user?.nombre}</p>
                <p className="text-sm text-muted">{state.user?.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Mi Perfil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}