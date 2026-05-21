import { useMemo, useEffect, useRef, useState } from 'react'
import { usePOS } from '../../context/POSContext'
import { formatCurrency } from '../../data/mockData'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { motion, AnimatePresence, useMotionValue, useSpring, useInView } from 'framer-motion'

// Animated counter hook
function useCountUp(target, duration = 1500, shouldStart = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return
    const isFloat = String(target).includes('.')
    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0
    const prefix = String(target).match(/^[^0-9]*/)?.[0] || ''
    const suffix = String(target).match(/[^0-9.]*$/)?.[0] || ''

    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * numericTarget
      setCount(isFloat ? current.toFixed(2) : Math.floor(current))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])

  return count
}

// Animated KPI Card
function KpiCard({ kpi, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const Icon = kpi.icon
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown
  const animatedValue = useCountUp(kpi.rawValue, 1800, isInView)

  const displayValue = kpi.isFloat
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(animatedValue)
    : animatedValue

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-5 relative overflow-hidden cursor-default group"
    >
      {/* Animated gradient top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.color}`} />

      {/* Glow effect on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}
      />

      {/* Floating particles */}
      <motion.div
        className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${kpi.color} rounded-full opacity-5`}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: index * 0.5 }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{kpi.label}</p>
          <motion.p
            className="text-2xl font-bold text-white tabular-nums"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.12 + 0.3 }}
          >
            {displayValue}
          </motion.p>
        </div>
        <motion.div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
          whileHover={{ rotate: 15, scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      <motion.div
        className={`flex items-center gap-1 mt-3 text-sm ${kpi.trend === 'up' ? 'text-success' : 'text-danger'}`}
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.12 + 0.5, duration: 0.4 }}
      >
        <motion.div
          animate={kpi.trend === 'up'
            ? { y: [0, -3, 0] }
            : { y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <TrendIcon className="w-4 h-4" />
        </motion.div>
        <span>{kpi.change}</span>
        <span className="text-muted">vs ayer</span>
      </motion.div>
    </motion.div>
  )
}

// Custom bar shape with CSS animation (no motion.rect - breaks Recharts)
function AnimatedBar(props) {
  const { x, y, width, height, fill, index } = props
  if (!width || !height || height <= 0) return null
  const animDelay = (index ?? 0) * 80 + 200
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={6}
        ry={6}
        style={{
          transformOrigin: `${x + width / 2}px ${y + height}px`,
          animation: `barGrow 0.7s cubic-bezier(0.23,1,0.32,1) ${animDelay}ms both`
        }}
      />
    </g>
  )
}

export default function Dashboard() {
  const { state, getPaymentMethod, getProduct, getLowStockProducts } = usePOS()
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  const kpis = useMemo(() => {
    const completedSales = state.ventas.filter(v => v.estado === 'completada')
    const todaySales = completedSales.reduce((sum, v) => sum + v.total, 0)
    const totalTransactions = completedSales.length
    const avgTicket = totalTransactions > 0 ? todaySales / totalTransactions : 0
    const productsSold = state.detalleVenta
      .filter(d => {
        const venta = state.ventas.find(v => v.id === d.venta_id)
        return venta?.estado === 'completada'
      })
      .reduce((sum, d) => sum + d.cantidad, 0)

    return [
      {
        label: 'Ventas Totales',
        rawValue: todaySales,
        value: formatCurrency(todaySales),
        isFloat: true,
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'from-primary to-accent'
      },
      {
        label: 'Transacciones',
        rawValue: totalTransactions,
        value: totalTransactions,
        isFloat: false,
        change: '+8.2%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'from-emerald-500 to-teal-500'
      },
      {
        label: 'Ticket Promedio',
        rawValue: avgTicket,
        value: formatCurrency(avgTicket),
        isFloat: true,
        change: '-2.1%',
        trend: 'down',
        icon: CreditCard,
        color: 'from-amber-500 to-orange-500'
      },
      {
        label: 'Productos Vendidos',
        rawValue: productsSold,
        value: productsSold,
        isFloat: false,
        change: '+15.3%',
        trend: 'up',
        icon: Package,
        color: 'from-violet-500 to-purple-500'
      }
    ]
  }, [state.ventas, state.detalleVenta])

  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - i))
      const baseAmount = state.ventas
        .filter(v => v.estado === 'completada')
        .reduce((sum, v) => sum + v.total, 0) / 7
      const variation = Math.random() * 0.4 - 0.2
      return {
        day: days[date.getDay()],
        ventas: Math.round(baseAmount * (1 + variation))
      }
    })
  }, [state.ventas])

  const topProducts = useMemo(() => {
    const productSales = {}
    state.detalleVenta.forEach(detail => {
      const venta = state.ventas.find(v => v.id === detail.venta_id)
      if (venta?.estado === 'completada') {
        if (!productSales[detail.producto_id]) {
          productSales[detail.producto_id] = { cantidad: 0, total: 0 }
        }
        productSales[detail.producto_id].cantidad += detail.cantidad
        productSales[detail.producto_id].total += detail.subtotal
      }
    })
    return Object.entries(productSales)
      .map(([productId, data]) => {
        const product = getProduct(parseInt(productId))
        return {
          id: productId,
          nombre: product?.nombre || 'Producto eliminado',
          cantidad: data.cantidad,
          total: data.total
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [state.detalleVenta, state.ventas, getProduct])

  const corteDeCaja = useMemo(() => {
    const paymentTotals = {}
    state.ventasPagos.forEach(payment => {
      const venta = state.ventas.find(v => v.id === payment.venta_id)
      if (venta?.estado === 'completada') {
        if (!paymentTotals[payment.metodo_pago_id]) {
          paymentTotals[payment.metodo_pago_id] = 0
        }
        paymentTotals[payment.metodo_pago_id] += payment.monto
      }
    })
    return Object.entries(paymentTotals).map(([methodId, total]) => {
      const method = getPaymentMethod(parseInt(methodId))
      return { metodo: method?.nombre || 'Desconocido', total }
    })
  }, [state.ventasPagos, state.ventas, getPaymentMethod])

  const lowStockProducts = getLowStockProducts()

  const barColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#818cf8', '#6366f1', '#7c3aed', '#4f46e5']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass rounded-lg px-3 py-2 shadow-lg"
        >
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-sm text-primary">{formatCurrency(payload[0].value)}</p>
        </motion.div>
      )
    }
    return null
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
  }

  const maxProductTotal = topProducts[0]?.total || 1

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Sales Chart */}
        <motion.div
          variants={cardVariants}
          className="glass rounded-2xl p-6 overflow-hidden relative"
        >
          <motion.div
            className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-full opacity-5"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-lg font-semibold text-white">Ventas Semanales</h3>
              <p className="text-sm text-muted">Últimos 7 días</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <BarChart3 className="w-5 h-5 text-muted" />
            </motion.div>
          </div>

          <style>{`@keyframes barGrow{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}`}</style>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="ventas"
                  maxBarSize={48}
                  shape={(props) => (
                    <AnimatedBar
                      {...props}
                      fill={barColors[props.index % barColors.length]}
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Top 5 Productos</h3>
              <p className="text-sm text-muted">Por monto de ventas</p>
            </div>
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
            >
              <Package className="w-5 h-5 text-muted" />
            </motion.div>
          </div>

          {topProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-muted mb-3" />
              <p className="text-muted">Sin datos de ventas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className="relative flex items-center gap-4 p-3 bg-surface-light rounded-xl hover:bg-surface transition-colors overflow-hidden group"
                >
                  {/* Progress bar background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: product.total / maxProductTotal }}
                    transition={{ delay: index * 0.1 + 0.7, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                    style={{ transformOrigin: 'left' }}
                  />
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm relative z-10"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {index + 1}
                  </motion.div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-white font-medium truncate">{product.nombre}</p>
                    <p className="text-sm text-muted">{product.cantidad} unidades</p>
                  </div>
                  <motion.p
                    className="text-white font-semibold relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                  >
                    {formatCurrency(product.total)}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Corte de Caja */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Corte de Caja</h3>
              <p className="text-sm text-muted">Por método de pago</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <CreditCard className="w-5 h-5 text-muted" />
            </motion.div>
          </div>

          {corteDeCaja.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <CreditCard className="w-12 h-12 text-muted mb-3" />
              <p className="text-muted">Sin pagos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {corteDeCaja.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3 bg-surface-light rounded-xl"
                >
                  <span className="text-white">{item.metodo}</span>
                  <motion.span
                    className="text-white font-semibold tabular-nums"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.6, type: 'spring', stiffness: 200 }}
                  >
                    {formatCurrency(item.total)}
                  </motion.span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: corteDeCaja.length * 0.1 + 0.5, duration: 0.5 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl"
              >
                <span className="text-white font-semibold">Total</span>
                <motion.span
                  className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  {formatCurrency(corteDeCaja.reduce((sum, item) => sum + item.total, 0))}
                </motion.span>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div variants={cardVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Alertas de Stock</h3>
              <p className="text-sm text-muted">Productos con stock bajo</p>
            </div>
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            >
              <AlertTriangle className="w-5 h-5 text-warning" />
            </motion.div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Package className="w-12 h-12 text-success mb-3" />
              </motion.div>
              <p className="text-success font-medium">¡Todo en orden!</p>
              <p className="text-sm text-muted">No hay productos con stock bajo</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {lowStockProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.12 + 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{product.nombre}</p>
                      <p className="text-sm text-warning">
                        Stock: {product.stock} / {product.stock_minimo} mínimo
                      </p>
                    </div>
                    <motion.div
                      animate={product.stock === 0
                        ? { scale: [1, 1.1, 1], opacity: [1, 0.6, 1] }
                        : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-danger/20 text-danger'
                          : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {product.stock === 0 ? 'Agotado' : 'Bajo'}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}