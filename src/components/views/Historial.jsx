import { useState, useMemo } from 'react'
import { usePOS } from '../../context/POSContext'
import { formatCurrency } from '../../data/mockData'
import {
  Search,
  Calendar,
  Eye,
  X,
  RotateCcw,
  XCircle,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const estadoConfig = {
  completada: { label: 'Completada', color: 'bg-success/20 text-success', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: 'bg-danger/20 text-danger', icon: XCircle },
  devuelta: { label: 'Devuelta', color: 'bg-warning/20 text-warning', icon: RotateCcw }
}

export default function Historial() {
  const { state, dispatch, getUser, getProduct, getPaymentMethod, addToast } = usePOS()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  
  const filteredSales = useMemo(() => {
    return state.ventas
      .filter(sale => {
        const matchesSearch = search === '' ||
          sale.folio.toLowerCase().includes(search.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || sale.estado === statusFilter
        
        const matchesDate = dateFilter === '' ||
          sale.fecha.startsWith(dateFilter)
        
        return matchesSearch && matchesStatus && matchesDate
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [state.ventas, search, statusFilter, dateFilter])
  
  const getSaleDetails = (saleId) => {
    return state.detalleVenta.filter(d => d.venta_id === saleId)
  }
  
  const getSalePayments = (saleId) => {
    return state.ventasPagos.filter(p => p.venta_id === saleId)
  }
  
  const handleCancel = (sale) => {
    dispatch({ type: 'CANCEL_SALE', payload: sale.id })
    addToast(`Venta ${sale.folio} cancelada correctamente`, 'success')
    setShowConfirmModal(null)
    setSelectedSale(null)
  }
  
  const handleReturn = (sale) => {
    dispatch({ type: 'RETURN_SALE', payload: sale.id })
    addToast(`Devolución de ${sale.folio} procesada correctamente`, 'success')
    setShowConfirmModal(null)
    setSelectedSale(null)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Historial de Ventas</h1>
        <p className="text-muted">{state.ventas.length} ventas registradas</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por folio..."
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
          <option value="devuelta">Devuelta</option>
        </select>
        
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
          />
        </div>
      </div>
      
      {/* Sales Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Folio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 hidden md:table-cell">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 hidden lg:table-cell">Cajero</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Total</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No se encontraron ventas</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const user = getUser(sale.usuario_id)
                  const config = estadoConfig[sale.estado]
                  const Icon = config.icon
                  
                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-border last:border-0 hover:bg-surface-light/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{sale.folio}</p>
                        <p className="text-sm text-muted md:hidden">
                          {new Date(sale.fecha).toLocaleDateString('es-MX')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">
                        <p>{new Date(sale.fecha).toLocaleDateString('es-MX')}</p>
                        <p className="text-sm text-muted">
                          {new Date(sale.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold">
                            {user?.avatar}
                          </div>
                          <span className="text-zinc-400">{user?.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-semibold">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {sale.estado === 'completada' && (
                            <>
                              <button
                                onClick={() => setShowConfirmModal({ type: 'cancel', sale })}
                                className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                                title="Cancelar venta"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowConfirmModal({ type: 'return', sale })}
                                className="p-2 rounded-lg text-zinc-400 hover:text-warning hover:bg-warning/10 transition-colors"
                                title="Procesar devolución"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
      
      {/* Sale Detail Slide Panel */}
      {selectedSale && (
        <SaleDetailPanel
          sale={selectedSale}
          details={getSaleDetails(selectedSale.id)}
          payments={getSalePayments(selectedSale.id)}
          getProduct={getProduct}
          getUser={getUser}
          getPaymentMethod={getPaymentMethod}
          onClose={() => setSelectedSale(null)}
          onCancel={() => setShowConfirmModal({ type: 'cancel', sale: selectedSale })}
          onReturn={() => setShowConfirmModal({ type: 'return', sale: selectedSale })}
        />
      )}
      
      {/* Confirm Modal */}
      {showConfirmModal && (
        <ConfirmModal
          type={showConfirmModal.type}
          sale={showConfirmModal.sale}
          onConfirm={() => {
            if (showConfirmModal.type === 'cancel') {
              handleCancel(showConfirmModal.sale)
            } else {
              handleReturn(showConfirmModal.sale)
            }
          }}
          onClose={() => setShowConfirmModal(null)}
        />
      )}
    </div>
  )
}

// Sale Detail Panel Component
function SaleDetailPanel({ sale, details, payments, getProduct, getUser, getPaymentMethod, onClose, onCancel, onReturn }) {
  const user = getUser(sale.usuario_id)
  const config = estadoConfig[sale.estado]
  const Icon = config.icon
  
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md glass border-l border-border z-50 animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">{sale.folio}</h2>
            <p className="text-sm text-muted">
              {new Date(sale.fecha).toLocaleString('es-MX')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Estado</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
              <Icon className="w-4 h-4" />
              {config.label}
            </span>
          </div>
          
          {/* Cashier */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Cajero</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold">
                {user?.avatar}
              </div>
              <span className="text-white">{user?.nombre}</span>
            </div>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Productos</h3>
            <div className="space-y-2">
              {details.map((detail) => {
                const product = getProduct(detail.producto_id)
                return (
                  <div key={detail.id} className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {product?.nombre || 'Producto eliminado'}
                      </p>
                      <p className="text-sm text-muted">
                        {detail.cantidad} x {formatCurrency(detail.precio_unitario)}
                      </p>
                    </div>
                    <p className="text-white font-medium">{formatCurrency(detail.subtotal)}</p>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex justify-between">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Impuestos</span>
              <span className="text-white">{formatCurrency(sale.impuestos)}</span>
            </div>
            {sale.descuento > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Descuento</span>
                <span className="text-success">-{formatCurrency(sale.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(sale.total)}</span>
            </div>
          </div>
          
          {/* Payments */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Pagos</h3>
            <div className="space-y-2">
              {payments.map((payment) => {
                const method = getPaymentMethod(payment.metodo_pago_id)
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
                    <span className="text-white">{method?.nombre}</span>
                    <span className="text-white font-medium">{formatCurrency(payment.monto)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {sale.estado === 'completada' && (
          <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-danger/10 border border-danger/20 rounded-xl text-danger font-medium hover:bg-danger/20 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={onReturn}
              className="flex-1 py-2.5 bg-warning/10 border border-warning/20 rounded-xl text-warning font-medium hover:bg-warning/20 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Devolver
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// Confirm Modal Component
function ConfirmModal({ type, sale, onConfirm, onClose }) {
  const isCancel = type === 'cancel'
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCancel ? 'bg-danger/20' : 'bg-warning/20'
          }`}>
            {isCancel ? (
              <XCircle className="w-6 h-6 text-danger" />
            ) : (
              <RotateCcw className="w-6 h-6 text-warning" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isCancel ? 'Cancelar Venta' : 'Procesar Devolución'}
            </h3>
            <p className="text-sm text-muted">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-zinc-400 mb-6">
          {isCancel
            ? `¿Estás seguro de que deseas cancelar la venta ${sale.folio}? El stock de los productos será restaurado.`
            : `¿Estás seguro de que deseas procesar la devolución de ${sale.folio}? El stock será restaurado y se registrará el movimiento de devolución.`
          }
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-colors ${
              isCancel
                ? 'bg-danger hover:bg-danger/80'
                : 'bg-warning hover:bg-warning/80'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
