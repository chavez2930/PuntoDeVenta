import { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  getProducts, getSales, getCategories, getUsers, 
  createProduct, updateProduct as apiUpdateProduct, deleteProduct as apiDeleteProduct,
  createCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory,
  completeSale as apiCompleteSale,
  createUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser
} from '../utils/api';
import { USE_MOCK_DATA } from '../config';
import {
  roles as mockRoles,
  usuarios as mockUsuarios,
  categorias as mockCategorias,
  productos as mockProductos,
  metodosPago as mockMetodosPago,
  ventas as mockVentas,
  detalleVenta as mockDetalleVenta,
  ventasPagos as mockVentasPagos,
  movimientosInventario as mockMovimientos,
  generateFolio
} from '../data/mockData';

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
  roles: [],
  usuarios: [],
  categorias: [],
  productos: [],
  metodosPago: [],
  ventas: [],
  detalleVenta: [],
  ventasPagos: [],
  movimientosInventario: [],

  // Cart
  cart: [],
  cartDiscount: 0,

  // UI
  loading: true, // Start with loading true
  toasts: [],

  // Modals
  activeModal: null,
  modalData: null
}

function posReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        productos: action.payload.products,
        ventas: action.payload.sales,
        categorias: action.payload.categories,
        usuarios: action.payload.users,
        roles: action.payload.roles,
        metodosPago: action.payload.paymentMethods,
        detalleVenta: action.payload.saleDetails,
        ventasPagos: action.payload.salePayments,
        movimientosInventario: action.payload.inventoryMovements,
        loading: false,
      };
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
      return { ...state, productos: [...state.productos, action.payload] }
    case 'UPDATE_PRODUCT':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUCT':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload) }

    // Categories
    case 'ADD_CATEGORY':
      return { ...state, categorias: [...state.categorias, action.payload] }
    case 'UPDATE_CATEGORY':
      return { ...state, categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, categorias: state.categorias.filter(c => c.id !== action.payload) }

    // Users
    case 'ADD_USER':
      return { ...state, usuarios: [...state.usuarios, action.payload] }
    case 'UPDATE_USER':
      return { ...state, usuarios: state.usuarios.map(u => u.id === action.payload.id ? action.payload : u) }
    case 'DELETE_USER':
      return { ...state, usuarios: state.usuarios.filter(u => u.id !== action.payload) }

    // Payment Methods
    case 'ADD_PAYMENT_METHOD':
      return { ...state, metodosPago: [...state.metodosPago, action.payload] }
    case 'UPDATE_PAYMENT_METHOD':
      return { ...state, metodosPago: state.metodosPago.map(m => m.id === action.payload.id ? action.payload : m) }
    case 'DELETE_PAYMENT_METHOD':
      return { ...state, metodosPago: state.metodosPago.filter(m => m.id !== action.payload) }

    // Sales
    case 'SALE_SUCCESS': {
      const { newSale, updatedProducts } = action.payload;
      return {
        ...state,
        ventas: [...state.ventas, newSale],
        productos: state.productos.map(p => {
          const update = updatedProducts.find(u => u.id === p.id);
          return update ? update : p;
        }),
        cart: [],
        cartDiscount: 0,
      };
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

  useEffect(() => {
    async function loadInitialData() {
      if (USE_MOCK_DATA) {
        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            products: mockProductos,
            sales: mockVentas,
            categories: mockCategorias,
            users: mockUsuarios,
            roles: mockRoles,
            paymentMethods: mockMetodosPago,
            saleDetails: mockDetalleVenta,
            salePayments: mockVentasPagos,
            inventoryMovements: mockMovimientos,
          }
        });
        return;
      }

      try {
        const [products, sales, categories, users] = await Promise.all([
          getProducts(),
          getSales(),
          getCategories(),
          getUsers(),
        ]);
        dispatch({ type: 'SET_INITIAL_DATA', payload: { products, sales, categories, users, roles: [], paymentMethods: [], saleDetails: [], salePayments: [], inventoryMovements: [] } });
      } catch (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Error fetching initial data', type: 'error' } });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadInitialData();
  }, []);


  // Auto-remove toasts
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.toasts])

  const addToast = (message, type = 'info') =>
    dispatch({ type: 'ADD_TOAST', payload: { message, type } })

  const addProduct = async (productData) => {
    if (USE_MOCK_DATA) {
      const newProduct = { ...productData, id: Date.now(), stock_actual: productData.stock };
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      return;
    }
    const tempId = Date.now();
    const newProduct = { ...productData, id: tempId, stock_actual: productData.stock };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    try {
      const savedProduct = await createProduct(productData);
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...savedProduct, id: tempId } });
    } catch (error) {
      dispatch({ type: 'DELETE_PRODUCT', payload: tempId });
      addToast(error.message, 'error');
    }
  };

  const updateProduct = async (productId, productData) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...productData, id: productId } });
      return;
    }
    const originalProduct = state.productos.find(p => p.id === productId);
    dispatch({ type: 'UPDATE_PRODUCT', payload: { ...productData, id: productId } });
    try {
      await apiUpdateProduct(productId, productData);
    } catch (error) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: originalProduct });
      addToast(error.message, 'error');
    }
  };

  const deleteProduct = async (productId) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      return;
    }
    const originalProducts = state.productos;
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    try {
      await apiDeleteProduct(productId);
    } catch (error) {
      dispatch({ type: 'SET_INITIAL_DATA', payload: { ...state, productos: originalProducts } });
      addToast(error.message, 'error');
    }
  };

  const addCategory = async (categoryData) => {
    if (USE_MOCK_DATA) {
      const newCategory = { ...categoryData, id: Date.now() };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      return;
    }
    const tempId = Date.now();
    const newCategory = { ...categoryData, id: tempId };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    try {
      const savedCategory = await createCategory(categoryData);
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...savedCategory, id: tempId } });
    } catch (error) {
      dispatch({ type: 'DELETE_CATEGORY', payload: tempId });
      addToast(error.message, 'error');
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...categoryData, id: categoryId } });
      return;
    }
    const originalCategory = state.categorias.find(c => c.id === categoryId);
    dispatch({ type: 'UPDATE_CATEGORY', payload: { ...categoryData, id: categoryId } });
    try {
      await apiUpdateCategory(categoryId, categoryData);
    } catch (error) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: originalCategory });
      addToast(error.message, 'error');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      return;
    }
    const originalCategories = state.categorias;
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    try {
      await apiDeleteCategory(categoryId);
    } catch (error) {
      dispatch({ type: 'SET_INITIAL_DATA', payload: { ...state, categorias: originalCategories } });
      addToast(error.message, 'error');
    }
  };

  const completeSale = async (saleData) => {
    if (USE_MOCK_DATA) {
      const { cart, cartDiscount, user, getCartTotals, getNextFolio } = saleData;
      const totals = getCartTotals();
      const newSale = {
        id: Math.max(0, ...state.ventas.map(v => v.id)) + 1,
        folio: getNextFolio(),
        usuario_id: user.id,
        subtotal: totals.subtotal,
        descuento: cartDiscount,
        impuestos: totals.impuestos,
        total: totals.total,
        estado: 'completada',
        creado_en: new Date().toISOString(),
      };
      const updatedProducts = state.productos.map(p => {
        const cartItem = cart.find(item => item.producto_id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.cantidad };
        }
        return p;
      });
      dispatch({ type: 'SALE_SUCCESS', payload: { newSale, updatedProducts } });
      addToast('Sale completed successfully!', 'success');
      return;
    }

    try {
      const result = await apiCompleteSale(saleData);
      if (result.success) {
        // Refetch products and sales to get the latest data
        const [products, sales] = await Promise.all([getProducts(), getSales()]);
        dispatch({ type: 'SET_INITIAL_DATA', payload: { ...state, products, sales } });
        dispatch({ type: 'CLEAR_CART' });
        addToast('Sale completed successfully!', 'success');
      } else {
        throw new Error(result.error || 'Failed to complete sale');
      }
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const addUser = async (userData) => {
    if (USE_MOCK_DATA) {
      const newUser = { ...userData, id: Date.now(), activo: true };
      dispatch({ type: 'ADD_USER', payload: newUser });
      return;
    }
    const tempId = Date.now();
    const newUser = { ...userData, id: tempId, activo: true };
    dispatch({ type: 'ADD_USER', payload: newUser });
    try {
      const savedUser = await createUser(userData);
      dispatch({ type: 'UPDATE_USER', payload: { ...savedUser, id: tempId } });
    } catch (error) {
      dispatch({ type: 'DELETE_USER', payload: tempId });
      addToast(error.message, 'error');
    }
  };

  const updateUser = async (userId, userData) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'UPDATE_USER', payload: { ...userData, id: userId } });
      return;
    }
    const originalUser = state.usuarios.find(u => u.id === userId);
    dispatch({ type: 'UPDATE_USER', payload: { ...userData, id: userId } });
    try {
      await apiUpdateUser(userId, userData);
    } catch (error) {
      dispatch({ type: 'UPDATE_USER', payload: originalUser });
      addToast(error.message, 'error');
    }
  };

  const deleteUser = async (userId) => {
    if (USE_MOCK_DATA) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      return;
    }
    const originalUsers = state.usuarios;
    dispatch({ type: 'DELETE_USER', payload: userId });
    try {
      await apiDeleteUser(userId);
    } catch (error) {
      dispatch({ type: 'SET_INITIAL_DATA', payload: { ...state, usuarios: originalUsers } });
      addToast(error.message, 'error');
    }
  };

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
    // This will need to be updated once roles are fetched
    return true;
  }

  const getNextFolio = () => {
    if (USE_MOCK_DATA) {
      return generateFolio(state.ventas[state.ventas.length - 1]?.folio);
    }
    // This will need to be updated for real data
    return "F0001";
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

  const value = {
    state, dispatch,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    completeSale,
    addUser,
    updateUser,
    deleteUser,
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