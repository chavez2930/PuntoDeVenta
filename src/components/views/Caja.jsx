import { useState, useEffect, useRef } from 'react'
import { usePOS } from '../../context/POSContext'
import { formatCurrency } from '../../data/mockData'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Percent,
  Check,
  Printer,
  X,
  Banknote,
  Wallet,
  ArrowLeftRight,
  Ticket,
  Package
} from 'lucide-react'

// Payment icons map
const paymentIcons = {
  Banknote,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Ticket
}

// ─── Generador de ticket HTML ────────────────────────────────────────────────
function generarTicketHTML({ sale, productos }) {
  const fecha = new Date(sale.fecha)
  const fechaStr = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  const horaStr  = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const itemsHTML = (sale.details || []).map(item => {
    const prod = productos.find(p => p.id === item.producto_id)
    const nombre = prod?.nombre || 'Producto'
    const unitario = formatCurrency(item.precio_unitario)
    const subtotal = formatCurrency(item.subtotal)
    const descLine = item.descuento > 0
      ? `<div class="item-desc">  Desc: -${formatCurrency(item.descuento)}</div>`
      : ''
    return `<div class="item">
      <div class="item-name">${nombre}</div>
      <div class="item-detail">${item.cantidad} x ${unitario}<span class="item-sub">${subtotal}</span></div>
      ${descLine}
    </div>`
  }).join('')

  const cambio = (() => {
    const pago = sale.payments?.find(p => p.metodo_tipo === 'efectivo' || p.metodo_nombre?.toLowerCase().includes('efectivo'))
    if (pago && pago.monto > sale.total) return formatCurrency(pago.monto - sale.total)
    return null
  })()

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ticket ${sale.folio}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family: 'Space Mono', 'Courier New', monospace;
    font-size: 12px;
    background: #f5f0e8;
    display: flex;
    justify-content: center;
    padding: 20px 10px;
    min-height: 100vh;
  }

  .wrap {
    width: 100%;
    max-width: 300px;
    background: #fff;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    padding: 14px 12px 10px;
    border-bottom: 1px dashed #ccc;
  }
  .logo-icon {
    display: inline-block;
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #22c55e);
    margin-bottom: 6px;
    line-height: 40px;
    font-size: 20px;
  }
  .store-name {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #111;
  }
  .store-sub {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
    margin-top: 2px;
  }

  /* ── Meta ── */
  .meta {
    padding: 8px 12px;
    border-bottom: 1px dashed #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .folio {
    font-size: 11px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: 1px;
  }
  .datetime {
    text-align: right;
    font-size: 9px;
    color: #666;
    line-height: 1.5;
  }

  /* ── Section label ── */
  .section-label {
    font-size: 8px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #999;
    padding: 6px 12px 2px;
  }

  /* ── Items ── */
  .items { padding: 4px 12px; }
  .item { padding: 4px 0; border-bottom: 1px dotted #eee; }
  .item:last-child { border-bottom: none; }
  .item-name {
    font-size: 11px;
    font-weight: 700;
    color: #111;
    line-height: 1.4;
  }
  .item-detail {
    font-size: 10px;
    color: #555;
    display: flex;
    justify-content: space-between;
    margin-top: 1px;
  }
  .item-sub { font-weight: 700; color: #111; }
  .item-desc { font-size: 9px; color: #22c55e; margin-top: 1px; }

  /* ── Divider ── */
  .divider { border: none; border-top: 1px dashed #ccc; margin: 4px 0; }
  .divider-solid { border: none; border-top: 2px solid #111; margin: 4px 0; }

  /* ── Totals ── */
  .totals { padding: 4px 12px; }
  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #555;
    padding: 2px 0;
  }
  .total-row .val { color: #111; }
  .total-row .disc { color: #22c55e; }

  /* ── Grand total ── */
  .grand-total {
    margin: 6px 12px;
    padding: 8px 10px;
    background: #111;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .gt-label {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #aaa;
  }
  .gt-amount {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  /* ── Payments ── */
  .payments { padding: 4px 12px 6px; }
  .pay-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #555;
    padding: 2px 0;
  }
  .pay-row .val { color: #111; font-weight: 700; }
  .cambio-row {
    display: flex;
    justify-content: space-between;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 5px;
    padding: 5px 8px;
    margin-top: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #16a34a;
  }

  /* ── Barcode ── */
  .barcode {
    display: flex;
    justify-content: center;
    gap: 1.5px;
    padding: 10px 12px 4px;
  }
  .barcode span {
    display: inline-block;
    height: 30px;
    background: #111;
    border-radius: 1px;
  }
  .barcode-num {
    text-align: center;
    font-size: 8px;
    color: #888;
    letter-spacing: 4px;
    padding-bottom: 8px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    padding: 6px 12px 14px;
    border-top: 1px dashed #ccc;
  }
  .gracias {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #111;
    margin-bottom: 3px;
  }
  .footer-sub {
    font-size: 8px;
    color: #888;
    line-height: 1.6;
  }

  /* ── Print button (hidden on print) ── */
  .print-btn {
    display: block;
    width: calc(100% - 24px);
    margin: 8px 12px 14px;
    padding: 10px;
    background: linear-gradient(135deg, #6366f1, #22c55e);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
  }

  /* ── @media print ── */
  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      background: white;
      padding: 0;
      display: block;
    }
    .wrap {
      max-width: 100%;
      width: 100%;
    }
    .print-btn { display: none !important; }
  }
</style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="logo-icon">🏪</div>
    <div class="store-name">POS System</div>
    <div class="store-sub">Punto de Venta</div>
  </div>

  <div class="meta">
    <div class="folio">${sale.folio}</div>
    <div class="datetime">${fechaStr}<br/>${horaStr}</div>
  </div>

  <div class="section-label">Productos</div>
  <div class="items">
    ${itemsHTML}
  </div>

  <hr class="divider"/>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span class="val">${formatCurrency(sale.subtotal)}</span></div>
    ${sale.descuento > 0 ? `<div class="total-row"><span>Descuento</span><span class="disc">-${formatCurrency(sale.descuento)}</span></div>` : ''}
    <div class="total-row"><span>IVA</span><span class="val">${formatCurrency(sale.impuestos)}</span></div>
  </div>

  <div class="grand-total">
    <span class="gt-label">Total</span>
    <span class="gt-amount">${formatCurrency(sale.total)}</span>
  </div>

  <div class="section-label">Forma de pago</div>
  <div class="payments">
    ${(sale.payments || []).map(p => `
      <div class="pay-row">
        <span>${p.metodo_nombre}</span>
        <span class="val">${formatCurrency(p.monto)}</span>
      </div>
    `).join('')}
    ${cambio ? `<div class="cambio-row"><span>💵 Cambio</span><span>${cambio}</span></div>` : ''}
  </div>

  <div class="barcode">
    ${Array.from({ length: 38 }, (_, i) =>
      `<span style="width:${[1,2,1,1,3,1,2,1,1,2][i%10]}px;opacity:${i%5===0?0.4:1}"></span>`
    ).join('')}
  </div>
  <div class="barcode-num">${sale.folio}</div>

  <div class="footer">
    <div class="gracias">¡Gracias!</div>
    <div class="footer-sub">Conserva este ticket para cualquier aclaración.</div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ &nbsp;Imprimir Ticket</button>
</div>
</body>
</html>`
}
export default function Caja() {
  const { state, dispatch, getCategory, getNextFolio, getCartTotals, addToast } = usePOS()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)
  const searchRef = useRef(null)
  
  // Filter products
  const filteredProducts = state.productos.filter(product => {
    if (!product.activo) return false
    
    const matchesSearch = search === '' || 
      product.nombre.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.codigo_barras.includes(search)
    
    const matchesCategory = selectedCategory === null || product.categoria_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  const cartTotals = getCartTotals()
  
  // Focus search on keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      addToast('Producto sin stock disponible', 'error')
      return
    }
    
    const cartItem = state.cart.find(item => item.producto_id === product.id)
    if (cartItem && cartItem.cantidad >= product.stock) {
      addToast('Stock insuficiente', 'error')
      return
    }
    
    dispatch({ type: 'ADD_TO_CART', payload: product })
  }
  
  const handleUpdateQuantity = (index, delta) => {
    const item = state.cart[index]
    const product = state.productos.find(p => p.id === item.producto_id)
    const newQty = item.cantidad + delta
    
    if (newQty <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: index })
      return
    }
    
    if (newQty > product.stock) {
      addToast('Stock insuficiente', 'error')
      return
    }
    
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { index, updates: { cantidad: newQty } } })
  }
  
  const handleItemDiscount = (index, discount) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { index, updates: { descuento: parseFloat(discount) || 0 } } })
  }
  
  const handleCompleteSale = (payments) => {
    const folio = getNextFolio()
    const now = new Date().toISOString()
    
    const sale = {
      folio,
      fecha: now,
      usuario_id: state.user.id,
      subtotal: cartTotals.subtotal,
      descuento: cartTotals.descuento,
      impuestos: cartTotals.impuestos,
      total: cartTotals.total,
      estado: 'completada'
    }
    
    const details = state.cart.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento: item.descuento,
      subtotal: (item.precio_unitario * item.cantidad) - item.descuento
    }))
    
    const stockUpdates = state.cart.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad
    }))
    
    const movements = state.cart.map(item => ({
      producto_id: item.producto_id,
      tipo: 'salida_venta',
      cantidad: -item.cantidad,
      fecha: now,
      usuario_id: state.user.id,
      notas: `Venta ${folio}`
    }))
    
    dispatch({
      type: 'COMPLETE_SALE',
      payload: { sale, details, payments, stockUpdates, movements }
    })
    
    setCompletedSale({ ...sale, details, payments })
    setShowPaymentModal(false)
    setShowSuccessModal(true)
    addToast('Venta completada exitosamente', 'success')
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 88px)' }}>
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search and Categories */}
        <div className="space-y-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU o código de barras... (F2)"
              className="w-full pl-12 pr-10 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted hover:text-white hover:bg-surface-light transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
                  : 'bg-surface border border-border text-zinc-400 hover:text-white hover:border-border-light'
              }`}
            >
              Todos
            </button>
            {state.categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
                    : 'bg-surface border border-border text-zinc-400 hover:text-white hover:border-border-light'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Package className="w-16 h-16 text-muted mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No se encontraron productos</h3>
              <p className="text-muted">Intenta con otra búsqueda o categoría</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredProducts.map((product, idx) => {
                const category = getCategory(product.categoria_id)
                const isLowStock = product.stock <= product.stock_minimo && product.stock > 0
                const isOutOfStock = product.stock <= 0

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    className={`glass rounded-xl px-4 py-3 text-left w-full transition-all duration-200 group relative overflow-hidden animate-slide-up ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-surface-light hover:shadow-lg hover:shadow-primary/10 active:scale-[0.99] hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl w-10 shrink-0 flex items-center justify-center">
                        {category?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm truncate transition-colors ${isOutOfStock ? 'text-zinc-500' : 'text-white group-hover:text-primary-light'}`}>
                          {product.nombre}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted">{product.sku}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-xs text-zinc-500 font-mono tracking-wide">{product.codigo_barras}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-0.5 w-20">
                        <span className="text-xs text-muted">Stock</span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          isOutOfStock
                            ? 'bg-danger/15 text-danger'
                            : isLowStock
                              ? 'bg-warning/15 text-warning'
                              : 'bg-success/15 text-success'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning animate-pulse' : 'bg-success'
                          }`} />
                          {isOutOfStock ? 'Agotado' : `${product.stock} pzs`}
                        </div>
                      </div>
                      <div className="shrink-0 text-right w-24">
                        <p className={`text-lg font-bold ${isOutOfStock ? 'text-zinc-500' : 'text-white'}`}>
                          {formatCurrency(product.precio_venta)}
                        </p>
                        {product.impuesto_pct > 0 && (
                          <p className="text-xs text-muted">+{product.impuesto_pct}% IVA</p>
                        )}
                      </div>
                      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isOutOfStock
                          ? 'bg-surface text-zinc-600'
                          : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                      }`}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Cart Section */}
      <div className="lg:w-96 flex flex-col glass rounded-2xl overflow-hidden min-h-0">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Carrito</h3>
            <span className="text-sm text-muted">({state.cart.length})</span>
          </div>
          {state.cart.length > 0 && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="text-sm text-danger hover:text-danger/80 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {state.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted mb-3" />
              <p className="text-muted">El carrito está vacío</p>
              <p className="text-sm text-muted">Agrega productos para comenzar</p>
            </div>
          ) : (
            state.cart.map((item, index) => (
              <div key={index} className="bg-surface-light rounded-xl p-3 animate-slide-up">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm truncate">{item.nombre}</h4>
                    <p className="text-xs text-muted">{formatCurrency(item.precio_unitario)} c/u</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: index })}
                    className="p-1 text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQuantity(index, -1)}
                      className="w-7 h-7 rounded-lg bg-surface border border-border text-zinc-400 hover:text-white hover:border-primary flex items-center justify-center transition-all duration-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-white font-medium text-sm">{item.cantidad}</span>
                    <button
                      onClick={() => handleUpdateQuantity(index, 1)}
                      className="w-7 h-7 rounded-lg bg-surface border border-border text-zinc-400 hover:text-white hover:border-primary flex items-center justify-center transition-all duration-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-muted" />
                    <input
                      type="number"
                      value={item.descuento || ''}
                      onChange={(e) => handleItemDiscount(index, e.target.value)}
                      placeholder="0"
                      className="w-14 px-2 py-1 bg-surface border border-border rounded-lg text-white text-xs text-right focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency((item.precio_unitario * item.cantidad) - item.descuento)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t border-border">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <span className="text-sm text-zinc-400">Descuento global</span>
            <div className="flex items-center gap-2">
              <span className="text-muted">$</span>
              <input
                type="number"
                value={state.cartDiscount || ''}
                onChange={(e) => dispatch({ type: 'SET_CART_DISCOUNT', payload: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-20 px-2 py-1 bg-surface border border-border rounded-lg text-white text-right focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Impuestos</span>
              <span className="text-white">{formatCurrency(cartTotals.impuestos)}</span>
            </div>
            {cartTotals.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Descuento</span>
                <span className="text-success">-{formatCurrency(cartTotals.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatCurrency(cartTotals.total)}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={state.cart.length === 0}
              className="w-full py-3 btn-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <CreditCard className="w-5 h-5" />
              Cobrar
            </button>
          </div>
        </div>
      </div>
      
      {showPaymentModal && (
        <PaymentModal
          total={cartTotals.total}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handleCompleteSale}
          metodosPago={state.metodosPago.filter(m => m.activo)}
        />
      )}
      
      {showSuccessModal && completedSale && (
        <SuccessModal
          sale={completedSale}
          productos={state.productos}
          onClose={() => {
            setShowSuccessModal(false)
            setCompletedSale(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ total, onClose, onComplete, metodosPago }) {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [cashReceived, setCashReceived]     = useState('')

  const isEfectivo = selectedMethod?.tipo === 'efectivo'
  const change     = isEfectivo && cashReceived ? parseFloat(cashReceived) - total : 0
  const canComplete = selectedMethod !== null && (!isEfectivo || parseFloat(cashReceived) >= total)

  const handleComplete = () => {
    onComplete([{
      metodo_id:     selectedMethod.id,
      metodo_pago_id: selectedMethod.id,
      metodo_nombre:  selectedMethod.nombre,
      metodo_tipo:    selectedMethod.tipo,
      monto:          total,
      efectivo_recibido: isEfectivo ? parseFloat(cashReceived) : null
    }])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg glass rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-white">Cobrar Venta</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="text-center">
            <p className="text-sm text-muted mb-1">Total a cobrar</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-3">Método de pago</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {metodosPago.map((method) => {
                const Icon       = paymentIcons[method.icono] || CreditCard
                const isSelected = selectedMethod?.id === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => { setSelectedMethod(method); setCashReceived('') }}
                    className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-border bg-surface-light text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : ''}`} />
                    <span className="text-xs font-medium">{method.nombre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {isEfectivo && (
            <div className="space-y-3 animate-slide-up">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Efectivo recibido</label>
                <input
                  autoFocus
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white text-xl font-semibold text-right focus:border-primary transition-colors"
                  placeholder="0.00"
                />
              </div>
              {change > 0 && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-center">
                  <p className="text-sm text-success mb-1">Cambio a devolver</p>
                  <p className="text-3xl font-bold text-success">{formatCurrency(change)}</p>
                </div>
              )}
            </div>
          )}

          {selectedMethod && !isEfectivo && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center animate-slide-up">
              <p className="text-sm text-primary">Confirma el pago en la terminal y presiona Completar Venta</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleComplete}
            disabled={!canComplete}
            className="flex-1 py-3 btn-gradient rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Completar Venta
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ sale, productos, onClose }) {

  const handlePrintTicket = () => {
    const html = generarTicketHTML({ sale, productos })
    const win = window.open('', '_blank', 'width=480,height=700,scrollbars=yes')
    if (!win) {
      // fallback si popups bloqueados
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      return
    }
    win.document.write(html)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="pt-8 pb-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Venta Exitosa!</h2>
          <p className="text-muted">Folio: <span className="text-primary font-mono font-semibold">{sale.folio}</span></p>
        </div>
        
        <div className="px-6 pb-6">
          <div className="bg-surface-light rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Impuestos</span>
              <span className="text-white">{formatCurrency(sale.impuestos)}</span>
            </div>
            {sale.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Descuento</span>
                <span className="text-success">-{formatCurrency(sale.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-success">{formatCurrency(sale.total)}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-zinc-400">Pagos recibidos:</p>
            {sale.payments.map((payment, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white">{payment.metodo_nombre}</span>
                <span className="text-white">{formatCurrency(payment.monto)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Aceptar
          </button>
          <button
            onClick={() => { handlePrintTicket(); onClose() }}
            className="flex-1 py-3 btn-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Generar Ticket
          </button>
        </div>
      </div>
    </div>
  )
}