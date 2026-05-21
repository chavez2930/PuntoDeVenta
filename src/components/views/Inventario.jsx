import { useState, useMemo } from 'react'
import { usePOS } from '../../context/POSContext'
import { formatCurrency } from '../../data/mockData'
import {
  Search,
  Plus,
  Minus,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
  AlertTriangle,
  Trash2,
  X,
  Check,
  History
} from 'lucide-react'

const movementConfig = {
  entrada: { label: 'Entrada', color: 'bg-success/20 text-success', icon: ArrowUpCircle },
  salida_venta: { label: 'Venta', color: 'bg-primary/20 text-primary', icon: ArrowDownCircle },
  ajuste: { label: 'Ajuste', color: 'bg-warning/20 text-warning', icon: RefreshCcw },
  devolucion: { label: 'Devolución', color: 'bg-accent/20 text-accent', icon: RefreshCcw },
  merma: { label: 'Merma', color: 'bg-danger/20 text-danger', icon: Trash2 }
}

export default function Inventario() {
  const { state, dispatch, getCategory, getProduct, getUser, addToast } = usePOS()
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [showAdjustModal, setShowAdjustModal] = useState(null)
  const [showMovements, setShowMovements] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const filteredProducts = useMemo(() => {
    return state.productos.filter(product => {
      if (!product.activo) return false
      
      const matchesSearch = search === '' ||
        product.nombre.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
      
      const isLowStock = product.stock <= product.stock_minimo
      const isOutOfStock = product.stock <= 0
      
      if (stockFilter === 'low') return matchesSearch && isLowStock && !isOutOfStock
      if (stockFilter === 'out') return matchesSearch && isOutOfStock
      if (stockFilter === 'ok') return matchesSearch && !isLowStock
      
      return matchesSearch
    })
  }, [state.productos, search, stockFilter])
  
  const recentMovements = useMemo(() => {
    return [...state.movimientosInventario]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 20)
  }, [state.movimientosInventario])
  
  const handleAdjust = async (data) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    dispatch({
      type: 'ADJUST_STOCK',
      payload: {
        producto_id: data.producto_id,
        cantidad: data.cantidad,
        tipo: data.tipo,
        notas: data.notas
      }
    })
    
    addToast('Stock ajustado correctamente', 'success')
    setShowAdjustModal(null)
    setLoading(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Control de Inventario</h1>
          <p className="text-muted">{state.productos.filter(p => p.activo).length} productos activos</p>
        </div>
        <button
          onClick={() => setShowMovements(true)}
          className="px-4 py-2 bg-surface border border-border rounded-xl text-white font-medium hover:bg-surface-light transition-colors flex items-center gap-2"
        >
          <History className="w-5 h-5" />
          Ver Movimientos
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
          />
        </div>
        
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
        >
          <option value="all">Todos los productos</option>
          <option value="low">Stock bajo</option>
          <option value="out">Sin stock</option>
          <option value="ok">Stock normal</option>
        </select>
      </div>
      
      {/* Stock summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted">Stock Normal</p>
              <p className="text-xl font-bold text-white">
                {state.productos.filter(p => p.activo && p.stock > p.stock_minimo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted">Stock Bajo</p>
              <p className="text-xl font-bold text-white">
                {state.productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stock_minimo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-muted">Sin Stock</p>
              <p className="text-xl font-bold text-white">
                {state.productos.filter(p => p.activo && p.stock <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 hidden md:table-cell">SKU</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Stock Actual</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400 hidden sm:table-cell">Mínimo</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ajustar</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No se encontraron productos</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const category = getCategory(product.categoria_id)
                  const isLowStock = product.stock <= product.stock_minimo
                  const isOutOfStock = product.stock <= 0
                  
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-surface-light/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-xl">
                            {category?.emoji}
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.nombre}</p>
                            <p className="text-sm text-muted md:hidden">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">{product.sku}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xl font-bold ${
                          isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-white'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="text-muted text-sm ml-1">{product.unidad_medida}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-400 hidden sm:table-cell">
                        {product.stock_minimo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isOutOfStock
                              ? 'bg-danger/20 text-danger'
                              : isLowStock
                                ? 'bg-warning/20 text-warning'
                                : 'bg-success/20 text-success'
                          }`}>
                            {isOutOfStock ? 'Agotado' : isLowStock ? 'Bajo' : 'OK'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowAdjustModal({ product, type: 'entrada' })}
                            className="p-2 rounded-lg text-zinc-400 hover:text-success hover:bg-success/10 transition-colors"
                            title="Agregar stock"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowAdjustModal({ product, type: 'ajuste' })}
                            className="p-2 rounded-lg text-zinc-400 hover:text-warning hover:bg-warning/10 transition-colors"
                            title="Ajustar stock"
                          >
                            <RefreshCcw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowAdjustModal({ product, type: 'merma' })}
                            className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Registrar merma"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Adjust Modal */}
      {showAdjustModal && (
        <AdjustStockModal
          product={showAdjustModal.product}
          initialType={showAdjustModal.type}
          onClose={() => setShowAdjustModal(null)}
          onSave={handleAdjust}
          loading={loading}
        />
      )}
      
      {/* Movements Panel */}
      {showMovements && (
        <MovementsPanel
          movements={recentMovements}
          getProduct={getProduct}
          getUser={getUser}
          onClose={() => setShowMovements(false)}
        />
      )}
    </div>
  )
}

// Adjust Stock Modal
function AdjustStockModal({ product, initialType, onClose, onSave, loading }) {
  const [tipo, setTipo] = useState(initialType)
  const [cantidad, setCantidad] = useState('')
  const [notas, setNotas] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cantidad || parseInt(cantidad) <= 0) return
    
    onSave({
      producto_id: product.id,
      cantidad: parseInt(cantidad),
      tipo,
      notas: notas || `${tipo === 'entrada' ? 'Entrada' : tipo === 'merma' ? 'Merma' : 'Ajuste'} manual`
    })
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Ajustar Stock</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product info */}
          <div className="p-4 bg-surface-light rounded-xl">
            <p className="font-medium text-white">{product.nombre}</p>
            <p className="text-sm text-muted">Stock actual: {product.stock} {product.unidad_medida}</p>
          </div>
          
          {/* Movement type */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo de movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('entrada')}
                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1 ${
                  tipo === 'entrada'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border bg-surface text-zinc-400 hover:text-white hover:border-border-light'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('ajuste')}
                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1 ${
                  tipo === 'ajuste'
                    ? 'border-warning bg-warning/10 text-warning'
                    : 'border-border bg-surface text-zinc-400 hover:text-white hover:border-border-light'
                }`}
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="text-xs font-medium">Ajuste</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('merma')}
                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1 ${
                  tipo === 'merma'
                    ? 'border-danger bg-danger/10 text-danger'
                    : 'border-border bg-surface text-zinc-400 hover:text-white hover:border-border-light'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">Merma</span>
              </button>
            </div>
          </div>
          
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white text-xl font-semibold text-center focus:border-primary transition-colors"
              placeholder="0"
              required
            />
            {cantidad && (
              <p className={`mt-2 text-sm ${tipo === 'entrada' ? 'text-success' : 'text-warning'}`}>
                Nuevo stock: {tipo === 'entrada' ? product.stock + parseInt(cantidad || 0) : Math.max(0, product.stock - parseInt(cantidad || 0))} {product.unidad_medida}
              </p>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors resize-none"
              placeholder="Razón del ajuste..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !cantidad}
              className="flex-1 py-2.5 btn-gradient rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Movements Panel
function MovementsPanel({ movements, getProduct, getUser, onClose }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg glass border-l border-border z-50 animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Movimientos de Inventario</h2>
            <p className="text-sm text-muted">Últimos 20 movimientos</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Movements list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {movements.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <History className="w-12 h-12 text-muted mb-3" />
              <p className="text-muted">Sin movimientos registrados</p>
            </div>
          ) : (
            movements.map((movement) => {
              const product = getProduct(movement.producto_id)
              const user = getUser(movement.usuario_id)
              const config = movementConfig[movement.tipo]
              const Icon = config?.icon || RefreshCcw
              
              return (
                <div key={movement.id} className="p-4 bg-surface-light rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config?.color || 'bg-zinc-500/20 text-zinc-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-white truncate">
                          {product?.nombre || 'Producto eliminado'}
                        </p>
                        <span className={`shrink-0 font-semibold ${
                          movement.cantidad > 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {movement.cantidad > 0 ? '+' : ''}{movement.cantidad}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{config?.label}</p>
                      {movement.notas && (
                        <p className="text-sm text-zinc-400 mt-1">{movement.notas}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-muted">
                        <span>{user?.nombre}</span>
                        <span>{new Date(movement.fecha).toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
