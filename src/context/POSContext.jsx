import { createContext, useContext, useReducer, useEffect } from 'react'
import {
  roles as initialRoles,
  usuarios as initialUsuarios,
  categorias as initialCategorias,
  productos as initialProductos,
  metodosPago as initialMetodosPago,
  ventas as initialVentas,
  detalleVenta as initialDetalleVenta,
  ventasPagos as initialVentasPagos,
  movimientosInventario as initialMovimientos,
  generateFolio
} from '../data/mockData'

const POSContext = createContext(null)

const initialState = {
  // Auth
  user: null,
  isAuthenticated: false,

  // Theme — persiste en localStorage
  theme: localStorage.getItem('pos-theme') || 'dark',

  // Navigation
  activeView: 'caja',
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  // Data
  roles: initialRoles,
  usuarios: initialUsuarios,
  categorias: initialCategorias,
  productos: initialProductos,
  metodosPago: initialMetodosPago,
  ventas: initialVentas,
  detalleVenta: initialDetalleVenta,
  ventasPagos: initialVentasPagos,
  movimientosInventario: initialMovimientos,

  // Cart
  cart: [],
  cartDiscount: 0,

  // UI
  loading: false,
  toasts: [],

  // Modals
  activeModal: null,
  modalData: null
}

function posReducer(state, action) {
  switch (action.type) {
    // Auth
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, activeView: 'caja' }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, cart: [], cartDiscount: 0 }

    // Theme
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('pos-theme', newTheme)
      return { ...state, theme: newTheme }
    }

    // Navigation
    case 'SET_VIEW':
      return { ...state, activeView: action.payload, mobileMenuOpen: false }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen }
    case 'CLOSE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: false }

    // Cart
    case 'ADD_TO_CART': {
      const existingIndex = state.cart.findIndex(item => item.producto_id === action.payload.id)
      if (existingIndex >= 0) {
        const newCart = [...state.cart]
        newCart[existingIndex].cantidad += 1
        return { ...state, cart: newCart }
      }
      return {
        ...state,
        cart: [...state.cart, {
          producto_id: action.payload.id,
          nombre: action.payload.nombre,
          precio_unitario: action.payload.precio_venta,
          impuesto_pct: action.payload.impuesto_pct,
          cantidad: 1,
          descuento: 0
        }]
      }
    }
    case 'UPDATE_CART_ITEM': {
      const newCart = state.cart.map((item, index) =>
        index === action.payload.index ? { ...item, ...action.payload.updates } : item
      )
      return { ...state, cart: newCart }
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, index) => index !== action.payload) }
    case 'CLEAR_CART':
      return { ...state, cart: [], cartDiscount: 0 }
    case 'SET_CART_DISCOUNT':
      return { ...state, cartDiscount: action.payload }

    // Products
    case 'ADD_PRODUCT':
      return { ...state, productos: [...state.productos, { ...action.payload, id: Math.max(...state.productos.map(p => p.id)) + 1 }] }
    case 'UPDATE_PRODUCT':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUCT':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload) }

    // Categories
    case 'ADD_CATEGORY':
      return { ...state, categorias: [...state.categorias, { ...action.payload, id: Math.max(...state.categorias.map(c => c.id)) + 1 }] }
    case 'UPDATE_CATEGORY':
      return { ...state, categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, categorias: state.categorias.filter(c => c.id !== action.payload) }

    // Users
    case 'ADD_USER':
      return { ...state, usuarios: [...state.usuarios, { ...action.payload, id: Math.max(...state.usuarios.map(u => u.id)) + 1 }] }
    case 'UPDATE_USER':
      return { ...state, usuarios: state.usuarios.map(u => u.id === action.payload.id ? action.payload : u) }
    case 'DELETE_USER':
      return { ...state, usuarios: state.usuarios.filter(u => u.id !== action.payload) }

    // Payment Methods
    case 'ADD_PAYMENT_METHOD':
      return { ...state, metodosPago: [...state.metodosPago, { ...action.payload, id: Math.max(...state.metodosPago.map(m => m.id)) + 1 }] }
    case 'UPDATE_PAYMENT_METHOD':
      return { ...state, metodosPago: state.metodosPago.map(m => m.id === action.payload.id ? action.payload : m) }
    case 'DELETE_PAYMENT_METHOD':
      return { ...state, metodosPago: state.metodosPago.filter(m => m.id !== action.payload) }

    // Sales
    case 'COMPLETE_SALE': {
      const { sale, details, payments, stockUpdates, movements } = action.payload
      const newVenta = { ...sale, id: Math.max(0, ...state.ventas.map(v => v.id)) + 1 }
      const newDetails = details.map((d, i) => ({
        ...d,
        id: Math.max(0, ...state.detalleVenta.map(dv => dv.id)) + 1 + i,
        venta_id: newVenta.id
      }))
      const newPayments = payments.map((p, i) => ({
        ...p,
        id: Math.max(0, ...state.ventasPagos.map(vp => vp.id)) + 1 + i,
        venta_id: newVenta.id
      }))
      const newMovements = movements.map((m, i) => ({
        ...m,
        id: Math.max(0, ...state.movimientosInventario.map(mv => mv.id)) + 1 + i
      }))
      const updatedProductos = state.productos.map(p => {
        const update = stockUpdates.find(u => u.producto_id === p.id)
        return update ? { ...p, stock: p.stock - update.cantidad } : p
      })
      return {
        ...state,
        ventas: [...state.ventas, newVenta],
        detalleVenta: [...state.detalleVenta, ...newDetails],
        ventasPagos: [...state.ventasPagos, ...newPayments],
        movimientosInventario: [...state.movimientosInventario, ...newMovements],
        productos: updatedProductos,
        cart: [],
        cartDiscount: 0
      }
    }

    case 'CANCEL_SALE': {
      const venta = state.ventas.find(v => v.id === action.payload)
      if (!venta) return state
      const details = state.detalleVenta.filter(d => d.venta_id === action.payload)
      const updatedProductos = state.productos.map(p => {
        const detail = details.find(d => d.producto_id === p.id)
        return detail ? { ...p, stock: p.stock + detail.cantidad } : p
      })
      return {
        ...state,
        ventas: state.ventas.map(v => v.id === action.payload ? { ...v, estado: 'cancelada' } : v),
        productos: updatedProductos
      }
    }

    case 'RETURN_SALE': {
      const venta = state.ventas.find(v => v.id === action.payload)
      if (!venta) return state
      const details = state.detalleVenta.filter(d => d.venta_id === action.payload)
      const updatedProductos = state.productos.map(p => {
        const detail = details.find(d => d.producto_id === p.id)
        return detail ? { ...p, stock: p.stock + detail.cantidad } : p
      })
      const newMovements = details.map((d, i) => ({
        id: Math.max(0, ...state.movimientosInventario.map(m => m.id)) + 1 + i,
        producto_id: d.producto_id,
        tipo: 'devolucion',
        cantidad: d.cantidad,
        fecha: new Date().toISOString(),
        usuario_id: state.user?.id || 1,
        notas: `Devolución ${venta.folio}`
      }))
      return {
        ...state,
        ventas: state.ventas.map(v => v.id === action.payload ? { ...v, estado: 'devuelta' } : v),
        productos: updatedProductos,
        movimientosInventario: [...state.movimientosInventario, ...newMovements]
      }
    }

    // Inventory
    case 'ADJUST_STOCK': {
      const { producto_id, cantidad, tipo, notas } = action.payload
      const newMovement = {
        id: Math.max(0, ...state.movimientosInventario.map(m => m.id)) + 1,
        producto_id,
        tipo,
        cantidad: tipo === 'entrada' ? cantidad : -cantidad,
        fecha: new Date().toISOString(),
        usuario_id: state.user?.id || 1,
        notas
      }
      const updatedProductos = state.productos.map(p => {
        if (p.id === producto_id) {
          const newStock = tipo === 'entrada' ? p.stock + cantidad : p.stock - cantidad
          return { ...p, stock: Math.max(0, newStock) }
        }
        return p
      })
      return {
        ...state,
        productos: updatedProductos,
        movimientosInventario: [...state.movimientosInventario, newMovement]
      }
    }

    // UI
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { ...action.payload, id: Date.now() }] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.payload.modal, modalData: action.payload.data || null }
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null, modalData: null }

    default:
      return state
  }
}

export function POSProvider({ children }) {
  const [state, dispatch] = useReducer(posReducer, initialState)

  // Auto-remove toasts
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.toasts])

  // Helpers
  const getRole          = (id) => state.roles.find(r => r.id === id)
  const getCategory      = (id) => state.categorias.find(c => c.id === id)
  const getProduct       = (id) => state.productos.find(p => p.id === id)
  const getUser          = (id) => state.usuarios.find(u => u.id === id)
  const getPaymentMethod = (id) => state.metodosPago.find(m => m.id === id)

  const hasPermission = (permission) => {
    if (!state.user) return false
    const role = getRole(state.user.rol_id)
    if (!role) return false
    return role.permisos.includes('all') || role.permisos.includes(permission)
  }

  const getNextFolio = () => {
    const lastVenta = state.ventas[state.ventas.length - 1]
    return generateFolio(lastVenta?.folio)
  }

  const getLowStockProducts = () =>
    state.productos.filter(p => p.activo && p.stock <= p.stock_minimo)

  const getCartTotals = () => {
    const subtotal = state.cart.reduce((sum, item) => {
      return sum + (item.precio_unitario * item.cantidad) - item.descuento
    }, 0)
    const impuestos = state.cart.reduce((sum, item) => {
      const base = (item.precio_unitario * item.cantidad) - item.descuento
      return sum + base * (item.impuesto_pct / 100)
    }, 0)
    const total = subtotal + impuestos - state.cartDiscount
    return { subtotal, impuestos, descuento: state.cartDiscount, total }
  }

  const addToast = (message, type = 'info') =>
    dispatch({ type: 'ADD_TOAST', payload: { message, type } })

  const value = {
    state, dispatch,
    getRole, getCategory, getProduct, getUser, getPaymentMethod,
    hasPermission, getNextFolio, getLowStockProducts, getCartTotals, addToast
  }

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  )
}

export function usePOS() {
  const context = useContext(POSContext)
  if (!context) throw new Error('usePOS must be used within a POSProvider')
  return context
}