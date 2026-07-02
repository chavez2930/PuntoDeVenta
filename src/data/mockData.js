// Mock Data for POS System

// Roles
export const roles = [
  { id: 1, nombre: 'Administrador', permisos: ['all'] },
  { id: 2, nombre: 'Cajero', permisos: ['caja', 'historial'] },
  { id: 3, nombre: 'Supervisor', permisos: ['caja', 'historial', 'inventario', 'productos', 'dashboard', 'reportes'] }
]

// Usuarios
export const usuarios = [
  { id: 1, nombre: 'Carlos Mendoza', email: 'admin@pos.com', password: 'admin123', rol_id: 1, activo: true, avatar: 'CM' },
  { id: 2, nombre: 'María García', email: 'cajero@pos.com', password: 'cajero123', rol_id: 2, activo: true, avatar: 'MG' },
  { id: 3, nombre: 'Roberto Sánchez', email: 'supervisor@pos.com', password: 'super123', rol_id: 3, activo: true, avatar: 'RS' }
]

// Categorías
export const categorias = [
  { id: 1, nombre: 'General', emoji: '📦', color: '#6366f1' },
  { id: 2, nombre: 'Alimentos', emoji: '🍕', color: '#f59e0b' },
  { id: 3, nombre: 'Bebidas', emoji: '🥤', color: '#22c55e' },
  { id: 4, nombre: 'Limpieza', emoji: '🧹', color: '#06b6d4' },
  { id: 5, nombre: 'Electrónica', emoji: '📱', color: '#8b5cf6' }
]

// Productos
export const productos = [
  { id: 1, categoria_id: 2, codigo_barras: '7501234567890', sku: 'ALI-001', nombre: 'Papas Sabritas Original', precio_compra: 12.00, precio_venta: 18.50, impuesto_pct: 16, stock: 45, stock_minimo: 10, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 2, categoria_id: 3, codigo_barras: '7501234567891', sku: 'BEB-001', nombre: 'Coca-Cola 600ml', precio_compra: 10.00, precio_venta: 18.00, impuesto_pct: 16, stock: 120, stock_minimo: 20, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 3, categoria_id: 2, codigo_barras: '7501234567892', sku: 'ALI-002', nombre: 'Galletas Marías', precio_compra: 8.50, precio_venta: 15.00, impuesto_pct: 0, stock: 35, stock_minimo: 15, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 4, categoria_id: 3, codigo_barras: '7501234567893', sku: 'BEB-002', nombre: 'Agua Bonafont 1L', precio_compra: 6.00, precio_venta: 12.00, impuesto_pct: 16, stock: 80, stock_minimo: 25, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 5, categoria_id: 4, codigo_barras: '7501234567894', sku: 'LIM-001', nombre: 'Detergente Roma 1kg', precio_compra: 25.00, precio_venta: 38.00, impuesto_pct: 16, stock: 8, stock_minimo: 10, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 6, categoria_id: 5, codigo_barras: '7501234567895', sku: 'ELE-001', nombre: 'Audífonos Bluetooth', precio_compra: 150.00, precio_venta: 299.00, impuesto_pct: 16, stock: 12, stock_minimo: 5, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 7, categoria_id: 2, codigo_barras: '7501234567896', sku: 'ALI-003', nombre: 'Pan Bimbo Grande', precio_compra: 28.00, precio_venta: 45.00, impuesto_pct: 0, stock: 22, stock_minimo: 8, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 8, categoria_id: 3, codigo_barras: '7501234567897', sku: 'BEB-003', nombre: 'Jugo Del Valle 1L', precio_compra: 15.00, precio_venta: 26.00, impuesto_pct: 16, stock: 40, stock_minimo: 15, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 9, categoria_id: 4, codigo_barras: '7501234567898', sku: 'LIM-002', nombre: 'Cloro Cloralex 1L', precio_compra: 18.00, precio_venta: 28.00, impuesto_pct: 16, stock: 25, stock_minimo: 10, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 10, categoria_id: 5, codigo_barras: '7501234567899', sku: 'ELE-002', nombre: 'Cable USB-C 2m', precio_compra: 45.00, precio_venta: 89.00, impuesto_pct: 16, stock: 18, stock_minimo: 8, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 11, categoria_id: 1, codigo_barras: '7501234567800', sku: 'GEN-001', nombre: 'Bolsa Ecológica', precio_compra: 5.00, precio_venta: 15.00, impuesto_pct: 16, stock: 50, stock_minimo: 20, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 12, categoria_id: 2, codigo_barras: '7501234567801', sku: 'ALI-004', nombre: 'Chocolate Abuelita', precio_compra: 22.00, precio_venta: 35.00, impuesto_pct: 0, stock: 3, stock_minimo: 10, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 13, categoria_id: 3, codigo_barras: '7501234567802', sku: 'BEB-004', nombre: 'Cerveza Corona 355ml', precio_compra: 14.00, precio_venta: 25.00, impuesto_pct: 16, stock: 60, stock_minimo: 24, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 14, categoria_id: 5, codigo_barras: '7501234567803', sku: 'ELE-003', nombre: 'Cargador Rápido 20W', precio_compra: 120.00, precio_venta: 249.00, impuesto_pct: 16, stock: 7, stock_minimo: 5, unidad_medida: 'pza', peso_variable: false, activo: true },
  { id: 15, categoria_id: 2, codigo_barras: '7501234567804', sku: 'ALI-005', nombre: 'Frijol a Granel', precio_compra: 22.00, precio_venta: 32.00, impuesto_pct: 0, stock: 40, stock_minimo: 10, unidad_medida: 'kg', peso_variable: true, activo: true },
  { id: 16, categoria_id: 2, codigo_barras: '7501234567805', sku: 'ALI-006', nombre: 'Arroz a Granel', precio_compra: 18.00, precio_venta: 26.00, impuesto_pct: 0, stock: 35, stock_minimo: 10, unidad_medida: 'kg', peso_variable: true, activo: true },
  { id: 17, categoria_id: 4, codigo_barras: '7501234567806', sku: 'LIM-003', nombre: 'Jabón Líquido a Granel', precio_compra: 30.00, precio_venta: 45.00, impuesto_pct: 16, stock: 20, stock_minimo: 5, unidad_medida: 'kg', peso_variable: true, activo: true }
]

// Métodos de pago
export const metodosPago = [
  { id: 1, nombre: 'Efectivo', tipo: 'efectivo', icono: 'Banknote', activo: true },
  { id: 2, nombre: 'Tarjeta débito', tipo: 'electronico', icono: 'CreditCard', activo: true },
  { id: 3, nombre: 'Tarjeta crédito', tipo: 'credito', icono: 'Wallet', activo: true },
  { id: 4, nombre: 'Transferencia', tipo: 'electronico', icono: 'ArrowLeftRight', activo: true },
  { id: 5, nombre: 'Vale despensa', tipo: 'vale', icono: 'Ticket', activo: true }
]

// Ventas históricas
export const ventas = [
  { id: 1, folio: 'VTA-00001', fecha: '2024-01-15T10:30:00', usuario_id: 2, subtotal: 156.50, descuento: 0, impuestos: 20.24, total: 176.74, estado: 'completada' },
  { id: 2, folio: 'VTA-00002', fecha: '2024-01-15T11:45:00', usuario_id: 2, subtotal: 89.00, descuento: 10, impuestos: 12.64, total: 91.64, estado: 'completada' },
  { id: 3, folio: 'VTA-00003', fecha: '2024-01-15T14:20:00', usuario_id: 3, subtotal: 324.00, descuento: 0, impuestos: 51.84, total: 375.84, estado: 'completada' },
  { id: 4, folio: 'VTA-00004', fecha: '2024-01-16T09:15:00', usuario_id: 2, subtotal: 45.00, descuento: 0, impuestos: 0, total: 45.00, estado: 'cancelada' },
  { id: 5, folio: 'VTA-00005', fecha: '2024-01-16T12:00:00', usuario_id: 2, subtotal: 567.00, descuento: 50, impuestos: 82.72, total: 599.72, estado: 'completada' },
  { id: 6, folio: 'VTA-00006', fecha: '2024-01-17T16:30:00', usuario_id: 3, subtotal: 128.00, descuento: 0, impuestos: 20.48, total: 148.48, estado: 'devuelta' },
  { id: 7, folio: 'VTA-00007', fecha: '2024-01-18T10:00:00', usuario_id: 2, subtotal: 234.50, descuento: 20, impuestos: 34.32, total: 248.82, estado: 'completada' },
  { id: 8, folio: 'VTA-00008', fecha: '2024-01-18T15:45:00', usuario_id: 2, subtotal: 412.00, descuento: 0, impuestos: 65.92, total: 477.92, estado: 'completada' }
]

// Detalle de ventas
export const detalleVenta = [
  { id: 1, venta_id: 1, producto_id: 2, cantidad: 3, precio_unitario: 18.00, descuento: 0, subtotal: 54.00 },
  { id: 2, venta_id: 1, producto_id: 1, cantidad: 2, precio_unitario: 18.50, descuento: 0, subtotal: 37.00 },
  { id: 3, venta_id: 1, producto_id: 7, cantidad: 1, precio_unitario: 45.00, descuento: 0, subtotal: 45.00 },
  { id: 4, venta_id: 2, producto_id: 10, cantidad: 1, precio_unitario: 89.00, descuento: 10, subtotal: 79.00 },
  { id: 5, venta_id: 3, producto_id: 6, cantidad: 1, precio_unitario: 299.00, descuento: 0, subtotal: 299.00 },
  { id: 6, venta_id: 3, producto_id: 13, cantidad: 1, precio_unitario: 25.00, descuento: 0, subtotal: 25.00 },
  { id: 7, venta_id: 5, producto_id: 14, cantidad: 2, precio_unitario: 249.00, descuento: 50, subtotal: 448.00 },
  { id: 8, venta_id: 5, producto_id: 4, cantidad: 5, precio_unitario: 12.00, descuento: 0, subtotal: 60.00 },
  { id: 9, venta_id: 7, producto_id: 8, cantidad: 3, precio_unitario: 26.00, descuento: 0, subtotal: 78.00 },
  { id: 10, venta_id: 7, producto_id: 5, cantidad: 2, precio_unitario: 38.00, descuento: 20, subtotal: 56.00 },
  { id: 11, venta_id: 8, producto_id: 6, cantidad: 1, precio_unitario: 299.00, descuento: 0, subtotal: 299.00 },
  { id: 12, venta_id: 8, producto_id: 11, cantidad: 3, precio_unitario: 15.00, descuento: 0, subtotal: 45.00 }
]

// Pagos de ventas
export const ventasPagos = [
  { id: 1, venta_id: 1, metodo_pago_id: 1, monto: 176.74 },
  { id: 2, venta_id: 2, metodo_pago_id: 2, monto: 91.64 },
  { id: 3, venta_id: 3, metodo_pago_id: 1, monto: 200.00 },
  { id: 4, venta_id: 3, metodo_pago_id: 3, monto: 175.84 },
  { id: 5, venta_id: 5, metodo_pago_id: 3, monto: 599.72 },
  { id: 6, venta_id: 7, metodo_pago_id: 1, monto: 248.82 },
  { id: 7, venta_id: 8, metodo_pago_id: 4, monto: 477.92 }
]

// Movimientos de inventario
export const movimientosInventario = [
  { id: 1, producto_id: 2, tipo: 'entrada', cantidad: 50, fecha: '2024-01-10T08:00:00', usuario_id: 1, notas: 'Compra a proveedor' },
  { id: 2, producto_id: 1, tipo: 'entrada', cantidad: 30, fecha: '2024-01-10T08:30:00', usuario_id: 1, notas: 'Compra a proveedor' },
  { id: 3, producto_id: 2, tipo: 'salida_venta', cantidad: 3, fecha: '2024-01-15T10:30:00', usuario_id: 2, notas: 'Venta VTA-00001' },
  { id: 4, producto_id: 1, tipo: 'salida_venta', cantidad: 2, fecha: '2024-01-15T10:30:00', usuario_id: 2, notas: 'Venta VTA-00001' },
  { id: 5, producto_id: 5, tipo: 'ajuste', cantidad: -2, fecha: '2024-01-14T16:00:00', usuario_id: 1, notas: 'Ajuste por conteo físico' },
  { id: 6, producto_id: 12, tipo: 'merma', cantidad: -5, fecha: '2024-01-13T12:00:00', usuario_id: 3, notas: 'Producto caducado' },
  { id: 7, producto_id: 6, tipo: 'devolucion', cantidad: 1, fecha: '2024-01-17T16:35:00', usuario_id: 3, notas: 'Devolución cliente VTA-00006' }
]

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount)
}

export const generateFolio = (lastFolio) => {
  if (!lastFolio) return 'VTA-00001'
  const num = parseInt(lastFolio.split('-')[1]) + 1
  return `VTA-${num.toString().padStart(5, '0')}`
}