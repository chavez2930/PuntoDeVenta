import { usePOS } from '../context/POSContext'
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  History,
  Warehouse,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
  FileBarChart2
} from 'lucide-react'

const menuItems = [
  { id: 'caja',         label: 'Caja',          icon: ShoppingCart,   permission: 'caja' },
  { id: 'dashboard',    label: 'Dashboard',      icon: LayoutDashboard,permission: 'dashboard' },
  { id: 'productos',    label: 'Productos',      icon: Package,        permission: 'productos' },
  { id: 'historial',    label: 'Historial',      icon: History,        permission: 'historial' },
  { id: 'inventario',   label: 'Inventario',     icon: Warehouse,      permission: 'inventario' },
  { id: 'reportes',     label: 'Reportes',       icon: FileBarChart2,  permission: 'reportes' },
  { id: 'configuracion',label: 'Configuración',  icon: Settings,       permission: 'configuracion' }
]

export default function Sidebar() {
  const { state, dispatch, hasPermission } = usePOS()
  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission))

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-surface border-r border-border transition-all duration-300 ${
          state.sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!state.sidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-white">POS System</h1>
                <p className="text-xs text-muted">Punto de Venta</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = state.activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
                title={state.sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!state.sidebarCollapsed && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            title={state.sidebarCollapsed ? 'Expandir' : 'Colapsar'}
            className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-surface-light transition-all duration-200"
          >
            {state.sidebarCollapsed
              ? <ChevronRight className="w-5 h-5" />
              : <ChevronLeft  className="w-5 h-5" />
            }
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transform transition-transform duration-300 lg:hidden ${
          state.mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">POS System</h1>
              <p className="text-xs text-muted">Punto de Venta</p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_MOBILE_MENU' })}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="p-3 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = state.activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}