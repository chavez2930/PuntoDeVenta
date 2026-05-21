import { useState, useMemo, useRef } from 'react'
import { usePOS } from '../../context/POSContext'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FileDown, Calendar, TrendingUp, Package, ShoppingCart,
  DollarSign, BarChart2, PieChart as PieIcon,
  FileText, Filter, RefreshCw, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import * as XLSX from 'xlsx'

// ─── Colores ────────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316']
const GRADIENT_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#22c55e', '#10b981'],
  ['#f59e0b', '#f97316'],
  ['#06b6d4', '#0ea5e9'],
  ['#ec4899', '#f43f5e'],
]

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtNum = (n) => Number(n || 0).toLocaleString('es-MX')
function parseDate(str) { return new Date(str) }
function getMonthLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
}
function getDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

// ─── Excel con estilos premium ───────────────────────────────────────────────
// Paleta de colores secundarios para zebra striping según el color principal
function getStripeColor(hex) {
  const map = {
    '4F46E5': { even: 'EEF2FF', odd: 'F8F9FF' }, // indigo
    '7C3AED': { even: 'F3F0FF', odd: 'F9F8FF' }, // violet
    'F59E0B': { even: 'FFFBEB', odd: 'FEFCE8' }, // amber
    '06B6D4': { even: 'ECFEFF', odd: 'F0FDFF' }, // cyan
    '10B981': { even: 'ECFDF5', odd: 'F0FDF4' }, // emerald
    '059669': { even: 'D1FAE5', odd: 'ECFDF5' }, // green
    'DC2626': { even: 'FEF2F2', odd: 'FFF5F5' }, // red
    '2563EB': { even: 'EFF6FF', odd: 'F0F8FF' }, // blue
  }
  return map[hex] || { even: 'F8F8FF', odd: 'FFFFFF' }
}

function getAccentColor(hex) {
  // Color más claro para totales y filas destacadas
  const map = {
    '4F46E5': 'C7D2FE', '7C3AED': 'DDD6FE', 'F59E0B': 'FDE68A',
    '06B6D4': 'A5F3FC', '10B981': 'A7F3D0', '059669': '6EE7B7',
    'DC2626': 'FECACA', '2563EB': 'BFDBFE',
  }
  return map[hex] || 'E0E7FF'
}

function makeStyledSheet(data, titleText, headerColor = '4F46E5') {
  if (!data.length) return XLSX.utils.json_to_sheet([])
  const keys = Object.keys(data[0])
  const stripe = getStripeColor(headerColor)
  const accent = getAccentColor(headerColor)

  const ws = {}
  // +4 filas: fila 0=título, fila 1=subtítulo/fecha, fila 2=vacía, fila 3=headers, fila 4+=datos, fila final=total
  const DATA_START_ROW = 4
  const totalRows = data.length + DATA_START_ROW
  const range = { s: { r: 0, c: 0 }, e: { r: totalRows, c: keys.length - 1 } }

  // ── Fila 0: Título principal con fondo sólido ──
  ws['A1'] = {
    v: `⬛  ${titleText.toUpperCase()}`, t: 's',
    s: {
      font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
      fill: { fgColor: { rgb: headerColor }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
    }
  }
  // Rellenar todas las celdas del título con el mismo fondo (para que se vea el merge)
  keys.forEach((_, c) => {
    if (c === 0) return
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    ws[addr] = { v: '', t: 's', s: { fill: { fgColor: { rgb: headerColor }, patternType: 'solid' } } }
  })

  // ── Fila 1: Subtítulo con fecha y rango ──
  const now = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  ws['A2'] = {
    v: `Generado el ${now}  •  ${data.length} registro${data.length !== 1 ? 's' : ''}`, t: 's',
    s: {
      font: { sz: 9, color: { rgb: 'FFFFFF' }, italic: true, name: 'Calibri' },
      fill: { fgColor: { rgb: headerColor }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
    }
  }
  keys.forEach((_, c) => {
    if (c === 0) return
    const addr = XLSX.utils.encode_cell({ r: 1, c })
    ws[addr] = { v: '', t: 's', s: { fill: { fgColor: { rgb: headerColor }, patternType: 'solid' } } }
  })

  // ── Fila 2: Separador vacío con color de acento suave ──
  keys.forEach((_, c) => {
    const addr = XLSX.utils.encode_cell({ r: 2, c })
    ws[addr] = { v: '', t: 's', s: { fill: { fgColor: { rgb: accent }, patternType: 'solid' } } }
  })

  // ── Fila 3: Encabezados de columnas ──
  keys.forEach((k, c) => {
    const addr = XLSX.utils.encode_cell({ r: 3, c })
    const isNumCol = /precio|total|valor|subtotal|descuento|impuesto|ticket|venta|cobrado|compra|margen|monto|cantidad|stock|unidad|transacc|posici/i.test(k)
    ws[addr] = {
      v: k.toUpperCase(), t: 's',
      s: {
        font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
        fill: { fgColor: { rgb: headerColor }, patternType: 'solid' },
        alignment: { horizontal: isNumCol ? 'center' : 'left', vertical: 'center', indent: isNumCol ? 0 : 1, wrapText: true },
        border: {
          top:    { style: 'thin', color: { rgb: accent } },
          bottom: { style: 'medium', color: { rgb: accent } },
          left:   { style: 'thin', color: { rgb: headerColor } },
          right:  { style: 'thin', color: { rgb: headerColor } },
        }
      }
    }
  })

  // ── Filas de datos ──
  // Detectar columnas numéricas y de dinero
  const numericKeys = keys.filter(k =>
    data.some(row => typeof row[k] === 'number')
  )
  const moneyKeys = keys.filter(k =>
    /precio|total|valor|subtotal|descuento|impuesto|ticket|venta|cobrado|compra|margen(?!\s*%)|monto/i.test(k)
  )

  data.forEach((row, r) => {
    const isEven = r % 2 === 0
    const bgColor = isEven ? stripe.even : stripe.odd

    keys.forEach((k, c) => {
      const addr = XLSX.utils.encode_cell({ r: r + DATA_START_ROW, c })
      let raw = row[k]
      const isNum = typeof raw === 'number'
      const isMoney = moneyKeys.includes(k)
      const isNumericCol = numericKeys.includes(k)

      // Transformar estados con íconos
      if (k === 'Estado' || k === 'estado') {
        if (raw === 'SIN STOCK') raw = '🔴  SIN STOCK'
        else if (raw === 'BAJO') raw = '🟡  STOCK BAJO'
        else if (raw === 'OK') raw = '🟢  OK'
        else if (raw === 'completada') raw = '✅  Completada'
        else if (raw === 'cancelada') raw = '❌  Cancelada'
        else if (raw === 'pendiente') raw = '⏳  Pendiente'
      }

      // Mini barra de progreso para columnas de % 
      if ((k.includes('%') || /porcentaje|participacion/i.test(k)) && isNum && raw >= 0 && raw <= 100) {
        const bars = Math.round(raw / 10)
        const filled = '█'.repeat(bars)
        const empty = '░'.repeat(10 - bars)
        raw = `${filled}${empty}  ${raw.toFixed(1)}%`
      }

      const cell = { v: raw ?? '', t: isNum && !isMoney ? 'n' : 's' }
      if (isMoney && isNum) {
        cell.v = raw
        cell.t = 'n'
        cell.z = '"$"#,##0.00'
      }

      cell.s = {
        font: { sz: 10, name: 'Calibri', bold: isNum && isMoney },
        fill: { fgColor: { rgb: bgColor }, patternType: 'solid' },
        alignment: {
          horizontal: isNumericCol ? 'right' : 'left',
          vertical: 'center',
          indent: isNumericCol ? 0 : 1,
        },
        border: {
          bottom: { style: 'thin', color: { rgb: isEven ? stripe.odd : stripe.even } },
          right:  { style: 'thin', color: { rgb: isEven ? stripe.odd : stripe.even } },
          left:   c === 0 ? { style: 'medium', color: { rgb: accent } } : { style: 'thin', color: { rgb: isEven ? stripe.odd : stripe.even } },
        }
      }

      // Primera columna con destacado extra (más grueso a la izquierda)
      if (c === 0) {
        cell.s.font = { ...cell.s.font, bold: true }
      }

      ws[addr] = cell
    })
  })

  // ── Fila de totales al final (solo si hay columnas numéricas) ──
  const hasTotals = moneyKeys.length > 0 || numericKeys.length > 0
  if (hasTotals) {
    const totalRow = data.length + DATA_START_ROW
    keys.forEach((k, c) => {
      const addr = XLSX.utils.encode_cell({ r: totalRow, c })
      const isMoney = moneyKeys.includes(k)
      const isNumericCol = numericKeys.includes(k)
      const isFirst = c === 0

      if (isFirst) {
        ws[addr] = {
          v: '▶  TOTAL', t: 's',
          s: {
            font: { bold: true, sz: 10, color: { rgb: headerColor }, name: 'Calibri' },
            fill: { fgColor: { rgb: accent }, patternType: 'solid' },
            alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
            border: {
              top:    { style: 'medium', color: { rgb: headerColor } },
              bottom: { style: 'medium', color: { rgb: headerColor } },
            }
          }
        }
      } else if (isMoney || (isNumericCol && !k.includes('%') && !/posici|estado|sku|folio|cajero|categor/i.test(k))) {
        const sum = data.reduce((s, row) => s + (typeof row[k] === 'number' ? row[k] : 0), 0)
        ws[addr] = {
          v: sum, t: 'n',
          z: isMoney ? '"$"#,##0.00' : '#,##0',
          s: {
            font: { bold: true, sz: 10, color: { rgb: headerColor }, name: 'Calibri' },
            fill: { fgColor: { rgb: accent }, patternType: 'solid' },
            alignment: { horizontal: 'right', vertical: 'center' },
            border: {
              top:    { style: 'medium', color: { rgb: headerColor } },
              bottom: { style: 'medium', color: { rgb: headerColor } },
            }
          }
        }
      } else {
        ws[addr] = {
          v: '', t: 's',
          s: {
            fill: { fgColor: { rgb: accent }, patternType: 'solid' },
            border: {
              top:    { style: 'medium', color: { rgb: headerColor } },
              bottom: { style: 'medium', color: { rgb: headerColor } },
            }
          }
        }
      }
    })
  }

  ws['!ref'] = XLSX.utils.encode_range(range)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: keys.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: keys.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: keys.length - 1 } },
  ]
  ws['!rows'] = [
    { hpt: 30 },  // título
    { hpt: 16 },  // subtítulo
    { hpt: 6  },  // separador
    { hpt: 22 },  // headers
    ...data.map(() => ({ hpt: 18 })),
    ...(hasTotals ? [{ hpt: 22 }] : []),
  ]
  ws['!cols'] = keys.map(k => ({
    wch: Math.min(42, Math.max(k.length + 6, ...data.map(row => String(row[k] ?? '').length + 2)))
  }))
  return ws
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '$' }) => {
  if (!active || !payload?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="glass rounded-xl px-3 py-2 shadow-lg"
    >
      <p className="text-sm text-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || '#fff' }}>
          {prefix === '$' ? fmt(p.value) : fmtNum(p.value)}
        </p>
      ))}
    </motion.div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, gradientFrom, gradientTo, index = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const twColor = gradientFrom === '#6366f1' ? 'from-primary to-accent'
    : gradientFrom === '#22c55e' ? 'from-emerald-500 to-teal-500'
    : gradientFrom === '#f59e0b' ? 'from-amber-500 to-orange-500'
    : gradientFrom === '#06b6d4' ? 'from-cyan-500 to-sky-500'
    : gradientFrom === '#ec4899' ? 'from-pink-500 to-rose-500'
    : gradientFrom === '#8b5cf6' ? 'from-violet-500 to-primary'
    : 'from-primary to-accent'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-5 relative overflow-hidden cursor-default group"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${twColor}`} />
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${twColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}
      />
      <motion.div
        className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${twColor} rounded-full opacity-5`}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: index * 0.5 }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <motion.p
            className="text-2xl font-bold text-white tabular-nums"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.12 + 0.3 }}
          >
            {value}
          </motion.p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <motion.div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${twColor} flex items-center justify-center`}
          whileHover={{ rotate: 15, scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
function Tab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer border-0 ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
          : 'bg-surface border border-border text-zinc-400 hover:text-white hover:border-white/20'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// ─── Period Selector ─────────────────────────────────────────────────────────
function PeriodSelector({ period, onChange }) {
  const options = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '3M' },
    { value: '1y', label: '1A' },
    { value: 'all', label: 'Todo' },
  ]
  return (
    <div className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all duration-150 ${
            period === o.value
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
              : 'bg-transparent text-muted hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ label = 'Sin datos en este período' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-primary opacity-50" />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function Reportes() {
  const { state, getProduct, getCategory } = usePOS()
  const [period, setPeriod] = useState('30d')
  const [tab, setTab] = useState('ventas')

  // cardVariants solo se usa en cards internas, NO en el contenedor raíz
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
  }

  // ── Filtrado por período ──
  const ventasFiltradas = useMemo(() => {
    const now = new Date()
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : period === '1y' ? 365 : 99999
    const cutoff = new Date(now.getTime() - days * 86400000)
    return state.ventas.filter(v => v.estado === 'completada' && parseDate(v.fecha) >= cutoff)
  }, [state.ventas, period])

  const ventasIds = useMemo(() => new Set(ventasFiltradas.map(v => v.id)), [ventasFiltradas])

  const detallesFiltrados = useMemo(() =>
    state.detalleVenta.filter(d => ventasIds.has(d.venta_id)),
    [state.detalleVenta, ventasIds]
  )

  // ── KPIs ──
  const kpis = useMemo(() => {
    const totalVentas = ventasFiltradas.reduce((s, v) => s + v.total, 0)
    const totalTransacciones = ventasFiltradas.length
    const ticketPromedio = totalTransacciones ? totalVentas / totalTransacciones : 0
    const totalDescuentos = ventasFiltradas.reduce((s, v) => s + (v.descuento || 0), 0)
    const totalImpuestos = ventasFiltradas.reduce((s, v) => s + (v.impuestos || 0), 0)
    const unidadesVendidas = detallesFiltrados.reduce((s, d) => s + d.cantidad, 0)
    return { totalVentas, totalTransacciones, ticketPromedio, totalDescuentos, totalImpuestos, unidadesVendidas }
  }, [ventasFiltradas, detallesFiltrados])

  // ── Ventas por día ──
  const ventasPorDia = useMemo(() => {
    const map = {}
    ventasFiltradas.forEach(v => {
      const key = v.fecha.slice(0, 10)
      map[key] = (map[key] || 0) + v.total
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ fecha: getDayLabel(fecha), total: +total.toFixed(2) }))
  }, [ventasFiltradas])

  // ── Ventas por mes ──
  const ventasPorMes = useMemo(() => {
    const map = {}
    ventasFiltradas.forEach(v => {
      const key = v.fecha.slice(0, 7)
      map[key] = (map[key] || 0) + v.total
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ mes: getMonthLabel(fecha + '-01'), total: +total.toFixed(2) }))
  }, [ventasFiltradas])

  // ── Top productos ──
  const topProductos = useMemo(() => {
    const map = {}
    detallesFiltrados.forEach(d => {
      const prod = getProduct(d.producto_id)
      if (!prod) return
      if (!map[d.producto_id]) map[d.producto_id] = { nombre: prod.nombre, cantidad: 0, total: 0 }
      map[d.producto_id].cantidad += d.cantidad
      map[d.producto_id].total += d.subtotal
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10)
  }, [detallesFiltrados, getProduct])

  // ── Ventas por categoría ──
  const ventasPorCategoria = useMemo(() => {
    const map = {}
    detallesFiltrados.forEach(d => {
      const prod = getProduct(d.producto_id)
      if (!prod) return
      const cat = getCategory(prod.categoria_id)
      const key = cat ? cat.nombre : 'Sin categoría'
      if (!map[key]) map[key] = { nombre: key, total: 0, cantidad: 0 }
      map[key].total += d.subtotal
      map[key].cantidad += d.cantidad
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [detallesFiltrados, getProduct, getCategory])

  // ── Métodos de pago ──
  const ventasPorMetodo = useMemo(() => {
    const map = {}
    state.ventasPagos.filter(p => ventasIds.has(p.venta_id)).forEach(p => {
      const metodo = state.metodosPago.find(m => m.id === p.metodo_id)
      const key = metodo ? metodo.nombre : 'Otro'
      if (!map[key]) map[key] = { nombre: key, total: 0, count: 0 }
      map[key].total += p.monto
      map[key].count += 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [state.ventasPagos, state.metodosPago, ventasIds])

  // ── Stock bajo ──
  const stockBajo = useMemo(() =>
    state.productos.filter(p => p.activo && p.stock <= p.stock_minimo)
      .map(p => ({
        Producto: p.nombre, SKU: p.sku,
        'Stock Actual': p.stock, 'Stock Mínimo': p.stock_minimo,
        'Precio Venta': fmt(p.precio_venta),
        Estado: p.stock === 0 ? 'SIN STOCK' : 'BAJO'
      })),
    [state.productos]
  )

  // ── Exports ──
  function exportarVentas() {
    const rows = ventasFiltradas.map(v => ({
      Folio: v.folio,
      Fecha: new Date(v.fecha).toLocaleString('es-MX'),
      Cajero: state.usuarios.find(u => u.id === v.usuario_id)?.nombre || '-',
      Subtotal: +Number(v.subtotal).toFixed(2),
      Descuento: +Number(v.descuento || 0).toFixed(2),
      Impuestos: +Number(v.impuestos).toFixed(2),
      Total: +Number(v.total).toFixed(2),
      Estado: v.estado,
    }))
    const detalles = detallesFiltrados.map(d => {
      const prod = getProduct(d.producto_id)
      const venta = ventasFiltradas.find(v => v.id === d.venta_id)
      return {
        Folio: venta?.folio || '-',
        Producto: prod?.nombre || '-',
        SKU: prod?.sku || '-',
        Cantidad: d.cantidad,
        'Precio Unitario': +Number(d.precio_unitario).toFixed(2),
        Descuento: +Number(d.descuento || 0).toFixed(2),
        Subtotal: +Number(d.subtotal).toFixed(2),
      }
    })
    const resumen = [
      { Métrica: 'Total Ventas',      Valor: +kpis.totalVentas.toFixed(2) },
      { Métrica: 'Transacciones',     Valor: kpis.totalTransacciones },
      { Métrica: 'Ticket Promedio',   Valor: +kpis.ticketPromedio.toFixed(2) },
      { Métrica: 'Unidades Vendidas', Valor: kpis.unidadesVendidas },
      { Métrica: 'Total Descuentos',  Valor: +kpis.totalDescuentos.toFixed(2) },
      { Métrica: 'Total Impuestos',   Valor: +kpis.totalImpuestos.toFixed(2) },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, makeStyledSheet(resumen,  `KPIs — ${period.toUpperCase()}`, '4F46E5'), '📊 KPIs')
    XLSX.utils.book_append_sheet(wb, makeStyledSheet(rows,     'Resumen de Ventas',              '7C3AED'), '💰 Resumen')
    XLSX.utils.book_append_sheet(wb, makeStyledSheet(detalles, 'Detalle de Ventas',              '2563EB'), '📋 Detalle')
    XLSX.writeFile(wb, `Reporte_Ventas_${period}.xlsx`)
  }

  function exportarInventario() {
    const rows = state.productos.filter(p => p.activo).map(p => {
      const cat = getCategory(p.categoria_id)
      return {
        SKU: p.sku,
        Producto: p.nombre,
        Categoría: cat?.nombre || '-',
        'Precio Compra': +Number(p.precio_compra).toFixed(2),
        'Precio Venta': +Number(p.precio_venta).toFixed(2),
        'Margen %': p.precio_compra > 0 ? +(((p.precio_venta - p.precio_compra) / p.precio_compra) * 100).toFixed(1) : 0,
        Stock: p.stock,
        'Stock Mínimo': p.stock_minimo,
        'Valor Inventario': +Number(p.stock * p.precio_compra).toFixed(2),
        'Valor a PVP': +Number(p.stock * p.precio_venta).toFixed(2),
        Estado: p.stock === 0 ? 'SIN STOCK' : p.stock <= p.stock_minimo ? 'BAJO' : 'OK',
      }
    })
    const alertas = rows.filter(r => r.Estado !== 'OK')
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, makeStyledSheet(rows, 'Inventario Completo', '059669'), '📦 Inventario')
    if (alertas.length) {
      XLSX.utils.book_append_sheet(wb, makeStyledSheet(alertas, 'Alertas de Stock', 'DC2626'), '🔴 Alertas')
    }
    XLSX.writeFile(wb, 'Reporte_Inventario.xlsx')
  }

  // ── Hoja de portada para el reporte completo ──
  function makeCoverSheet(period, kpis) {
    const ws = {}
    const now = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    const periodLabel = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 3 meses', '1y': 'Último año', all: 'Todo el historial' }[period] || period

    const lines = [
      // [row, col, value, style]
      [0,  0, '██████████████████████████████████',        { font: { sz: 8, color: { rgb: '4F46E5' } }, fill: { fgColor: { rgb: '4F46E5' }, patternType: 'solid' } }],
      [1,  0, '  REPORTE EJECUTIVO',                       { font: { bold: true, sz: 22, color: { rgb: 'FFFFFF' }, name: 'Calibri' }, fill: { fgColor: { rgb: '1E1B4B' }, patternType: 'solid' }, alignment: { horizontal: 'left', vertical: 'center', indent: 2 } }],
      [2,  0, `  ${periodLabel.toUpperCase()}`,            { font: { sz: 12, color: { rgb: 'A5B4FC' }, name: 'Calibri' }, fill: { fgColor: { rgb: '1E1B4B' }, patternType: 'solid' }, alignment: { horizontal: 'left', vertical: 'center', indent: 2 } }],
      [3,  0, `  ${now}`,                                  { font: { sz: 10, color: { rgb: '6366F1' }, italic: true, name: 'Calibri' }, fill: { fgColor: { rgb: '1E1B4B' }, patternType: 'solid' }, alignment: { horizontal: 'left', vertical: 'center', indent: 2 } }],
      [4,  0, '',                                          { fill: { fgColor: { rgb: '312E81' }, patternType: 'solid' } }],
      [5,  0, '',                                          { fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' } }],
      [6,  0, '  📊  RESUMEN DE INDICADORES CLAVE',        { font: { bold: true, sz: 11, color: { rgb: '1E1B4B' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'EEF2FF' }, patternType: 'solid' }, alignment: { horizontal: 'left', vertical: 'center', indent: 1 }, border: { left: { style: 'thick', color: { rgb: '4F46E5' } }, bottom: { style: 'thin', color: { rgb: 'C7D2FE' } } } }],
      [7,  0, '  💰  Total de Ventas',                     { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [7,  2, +kpis.totalVentas.toFixed(2),                { font: { bold: true, sz: 13, color: { rgb: '4F46E5' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, z: '"$"#,##0.00', t: 'n' }],
      [8,  0, '  🛒  Total Transacciones',                  { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [8,  2, kpis.totalTransacciones,                     { font: { bold: true, sz: 13, color: { rgb: '7C3AED' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, t: 'n' }],
      [9,  0, '  🎯  Ticket Promedio',                     { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [9,  2, +kpis.ticketPromedio.toFixed(2),             { font: { bold: true, sz: 13, color: { rgb: 'F59E0B' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, z: '"$"#,##0.00', t: 'n' }],
      [10, 0, '  📦  Unidades Vendidas',                   { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [10, 2, kpis.unidadesVendidas,                       { font: { bold: true, sz: 13, color: { rgb: '06B6D4' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, t: 'n' }],
      [11, 0, '  🏷️  Total Descuentos',                    { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [11, 2, +kpis.totalDescuentos.toFixed(2),            { font: { bold: true, sz: 13, color: { rgb: 'EC4899' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F8FAFC' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, z: '"$"#,##0.00', t: 'n' }],
      [12, 0, '  🧾  Total Impuestos',                     { font: { sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [12, 2, +kpis.totalImpuestos.toFixed(2),             { font: { bold: true, sz: 13, color: { rgb: '8B5CF6' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' }, alignment: { horizontal: 'left' }, z: '"$"#,##0.00', t: 'n' }],
      [13, 0, '',                                          { fill: { fgColor: { rgb: 'C7D2FE' }, patternType: 'solid' } }],
      [14, 0, '  📁  HOJAS INCLUIDAS EN ESTE REPORTE',     { font: { bold: true, sz: 10, color: { rgb: '374151' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'EEF2FF' }, patternType: 'solid' }, alignment: { indent: 1 }, border: { left: { style: 'thick', color: { rgb: '6366F1' } } } }],
      [15, 0, '  ▸  KPIs — Indicadores clave del período', { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FAFAFA' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [16, 0, '  ▸  Ventas — Detalle de transacciones',    { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F5F5FF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [17, 0, '  ▸  Top Productos — Los más vendidos',     { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FAFAFA' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [18, 0, '  ▸  Categorías — Ventas por categoría',    { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F5F5FF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [19, 0, '  ▸  Métodos de Pago — Distribución',       { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'FAFAFA' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [20, 0, '  ▸  Inventario — Stock y valorización',    { font: { sz: 9, color: { rgb: '4B5563' }, name: 'Calibri' }, fill: { fgColor: { rgb: 'F5F5FF' }, patternType: 'solid' }, alignment: { indent: 2 } }],
      [21, 0, '',                                          { fill: { fgColor: { rgb: '4F46E5' }, patternType: 'solid' } }],
    ]

    lines.forEach(([r, c, v, s]) => {
      const addr = XLSX.utils.encode_cell({ r, c })
      const isNum = typeof v === 'number'
      ws[addr] = { v, t: isNum ? 'n' : 's', s }
      if (s.z) ws[addr].z = s.z
      if (s.t) ws[addr].t = s.t
      // Rellenar el resto de la fila con el mismo fondo para filas de cabecera
      if ([0, 1, 2, 3, 4, 5, 13, 21].includes(r) && c === 0) {
        for (let fc = 1; fc < 5; fc++) {
          const fa = XLSX.utils.encode_cell({ r, c: fc })
          ws[fa] = { v: '', t: 's', s: { fill: s.fill } }
        }
      }
    })

    ws['!ref'] = 'A1:E22'
    ws['!merges'] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 4 } },
      { s: { r: 14, c: 0 }, e: { r: 14, c: 4 } },
      ...[15, 16, 17, 18, 19, 20].map(r => ({ s: { r, c: 0 }, e: { r, c: 4 } })),
    ]
    ws['!rows'] = [
      { hpt: 6 }, { hpt: 44 }, { hpt: 20 }, { hpt: 18 }, { hpt: 8 }, { hpt: 10 },
      { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 },
      { hpt: 6 }, { hpt: 20 },
      { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
      { hpt: 8 },
    ]
    ws['!cols'] = [{ wch: 32 }, { wch: 4 }, { wch: 20 }, { wch: 4 }, { wch: 4 }]
    return ws
  }

  function exportarCompleto() {
    const rowsKPIs = [
      { Métrica: 'Total Ventas',      Valor: +kpis.totalVentas.toFixed(2) },
      { Métrica: 'Transacciones',     Valor: kpis.totalTransacciones },
      { Métrica: 'Ticket Promedio',   Valor: +kpis.ticketPromedio.toFixed(2) },
      { Métrica: 'Unidades Vendidas', Valor: kpis.unidadesVendidas },
      { Métrica: 'Total Descuentos',  Valor: +kpis.totalDescuentos.toFixed(2) },
      { Métrica: 'Total Impuestos',   Valor: +kpis.totalImpuestos.toFixed(2) },
    ]
    const rowsVentas = ventasFiltradas.map(v => ({
      Folio: v.folio,
      Fecha: new Date(v.fecha).toLocaleString('es-MX'),
      Cajero: state.usuarios.find(u => u.id === v.usuario_id)?.nombre || '-',
      Subtotal: +Number(v.subtotal).toFixed(2),
      Descuento: +Number(v.descuento || 0).toFixed(2),
      Impuestos: +Number(v.impuestos).toFixed(2),
      Total: +Number(v.total).toFixed(2),
      Estado: v.estado,
    }))
    const rowsProductos = topProductos.map((p, i) => ({
      Posición: i + 1,
      Producto: p.nombre,
      'Unidades Vendidas': p.cantidad,
      'Total Vendido': +Number(p.total).toFixed(2),
    }))
    const rowsCats = ventasPorCategoria.map(c => ({
      Categoría: c.nombre,
      Unidades: c.cantidad,
      'Total Ventas': +Number(c.total).toFixed(2),
      '% del Total': kpis.totalVentas > 0 ? +(c.total / kpis.totalVentas * 100).toFixed(1) : 0,
    }))
    const rowsPagos = ventasPorMetodo.map(m => ({
      'Método de Pago': m.nombre,
      Transacciones: m.count,
      'Total Cobrado': +Number(m.total).toFixed(2),
      '% del Total': kpis.totalVentas > 0 ? +(m.total / kpis.totalVentas * 100).toFixed(1) : 0,
    }))
    const rowsInv = state.productos.filter(p => p.activo).map(p => {
      const cat = getCategory(p.categoria_id)
      return {
        SKU: p.sku,
        Producto: p.nombre,
        Categoría: cat?.nombre || '-',
        'P. Compra': +Number(p.precio_compra).toFixed(2),
        'P. Venta': +Number(p.precio_venta).toFixed(2),
        Stock: p.stock,
        'Valor Inv.': +Number(p.stock * p.precio_compra).toFixed(2),
        Estado: p.stock === 0 ? 'SIN STOCK' : p.stock <= p.stock_minimo ? 'BAJO' : 'OK',
      }
    })
    const wb = XLSX.utils.book_new()
    // 📋 Portada ejecutiva siempre al frente
    XLSX.utils.book_append_sheet(wb, makeCoverSheet(period, kpis), '📋 Portada')
    XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsKPIs, `KPIs ${period.toUpperCase()}`, '4F46E5'), '📊 KPIs')
    if (rowsVentas.length)    XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsVentas,    'Ventas del período',   '7C3AED'), '💰 Ventas')
    if (rowsProductos.length) XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsProductos, 'Top 10 Productos',     'F59E0B'), '🏆 Top Productos')
    if (rowsCats.length)      XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsCats,      'Ventas por Categoría', '06B6D4'), '🏷️ Categorías')
    if (rowsPagos.length)     XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsPagos,     'Métodos de Pago',      '10B981'), '💳 Pagos')
    if (rowsInv.length)       XLSX.utils.book_append_sheet(wb, makeStyledSheet(rowsInv,       'Inventario Completo',  '059669'), '📦 Inventario')
    XLSX.writeFile(wb, `Reporte_Completo_${period}.xlsx`)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <BarChart2 className="w-4 h-4 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reportes</h1>
          </div>
          <p className="text-sm text-muted">Análisis de ventas, inventario y rendimiento</p>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 flex-wrap">
          <motion.button
            onClick={exportarVentas}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/12 border border-primary/25 text-primary-hover cursor-pointer transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> Ventas
          </motion.button>
          <motion.button
            onClick={exportarInventario}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-success/12 border border-success/25 text-success cursor-pointer transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> Inventario
          </motion.button>
          <motion.button
            onClick={exportarCompleto}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> Reporte Completo
          </motion.button>
        </div>
      </motion.div>

      {/* ── Tabs bar — NUNCA se anima con variants, siempre visible ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <Tab active={tab === 'ventas'}     onClick={() => setTab('ventas')}     icon={TrendingUp}  label="Ventas" />
          <Tab active={tab === 'productos'}  onClick={() => setTab('productos')}  icon={Package}     label="Productos" />
          <Tab active={tab === 'categorias'} onClick={() => setTab('categorias')} icon={PieIcon}     label="Categorías" />
          <Tab active={tab === 'pagos'}      onClick={() => setTab('pagos')}      icon={DollarSign}  label="Pagos" />
          <Tab active={tab === 'inventario'} onClick={() => setTab('inventario')} icon={Filter}      label="Inventario" />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted" />
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard index={0} icon={DollarSign}   label="Total Ventas"      value={fmt(kpis.totalVentas)}           gradientFrom="#6366f1" gradientTo="#8b5cf6" />
        <KpiCard index={1} icon={ShoppingCart} label="Transacciones"     value={fmtNum(kpis.totalTransacciones)} gradientFrom="#22c55e" gradientTo="#10b981" />
        <KpiCard index={2} icon={TrendingUp}   label="Ticket Promedio"   value={fmt(kpis.ticketPromedio)}        gradientFrom="#f59e0b" gradientTo="#f97316" />
        <KpiCard index={3} icon={Package}      label="Unidades Vendidas" value={fmtNum(kpis.unidadesVendidas)}  gradientFrom="#06b6d4" gradientTo="#0ea5e9" />
        <KpiCard index={4} icon={FileText}     label="Descuentos"        value={fmt(kpis.totalDescuentos)}       gradientFrom="#ec4899" gradientTo="#f43f5e" />
        <KpiCard index={5} icon={BarChart2}    label="Impuestos"         value={fmt(kpis.totalImpuestos)}        gradientFrom="#8b5cf6" gradientTo="#6366f1" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT — cada tab es un motion.div independiente, sin variants heredados */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div>

        {/* TAB: VENTAS */}
        {tab === 'ventas' && (
          <motion.div
            key="ventas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-full opacity-5"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
              <SectionHeader title="Tendencia de Ventas" subtitle="Ingresos diarios en el período seleccionado" />
              {ventasPorDia.length === 0 ? <EmptyState /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ventasPorDia}>
                      <defs>
                        <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                      <XAxis dataKey="fecha" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradVentas)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Ventas Mensuales" subtitle="Comparativa de ingresos por mes" />
              {ventasPorMes.length === 0 ? <EmptyState /> : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasPorMes} barSize={28} barCategoryGap="30%">
                      <defs>
                        <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                      <XAxis dataKey="mes" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="total" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Detalle de Ventas" subtitle={`${ventasFiltradas.length} transacciones en el período`} />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/6">
                      {['Folio', 'Fecha', 'Cajero', 'Subtotal', 'Descuento', 'Total'].map(h => (
                        <th key={h} className={`py-2.5 px-3 text-xs font-semibold text-muted uppercase tracking-widest ${['Folio', 'Fecha', 'Cajero'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventasFiltradas.slice(0, 15).map((v, i) => (
                      <motion.tr
                        key={v.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/4 hover:bg-white/3 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">{v.folio}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted">{new Date(v.fecha).toLocaleDateString('es-MX')}</td>
                        <td className="py-2.5 px-3 text-xs text-muted">{state.usuarios.find(u => u.id === v.usuario_id)?.nombre || '-'}</td>
                        <td className="py-2.5 px-3 text-right text-xs text-muted">{fmt(v.subtotal)}</td>
                        <td className={`py-2.5 px-3 text-right text-xs font-medium ${v.descuento > 0 ? 'text-success' : 'text-zinc-700'}`}>
                          {v.descuento > 0 ? `-${fmt(v.descuento)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm font-bold text-white">{fmt(v.total)}</td>
                      </motion.tr>
                    ))}
                    {ventasFiltradas.length === 0 && (
                      <tr><td colSpan={6}><EmptyState /></td></tr>
                    )}
                  </tbody>
                  {ventasFiltradas.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-primary/20">
                        <td colSpan={4} className="py-2.5 px-3 text-xs text-muted">Total {ventasFiltradas.length} ventas</td>
                        <td className="py-2.5 px-3 text-right text-xs text-muted font-semibold">Total:</td>
                        <td className="py-2.5 px-3 text-right text-base font-bold text-primary">{fmt(kpis.totalVentas)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB: PRODUCTOS */}
        {tab === 'productos' && (
          <motion.div
            key="productos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Top 10 Productos" subtitle="Ordenados por total vendido" />
              {topProductos.length === 0 ? <EmptyState /> : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductos} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
                      <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="nombre" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                        {topProductos.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Ranking de Productos" subtitle="Performance individual" />
              <div className="space-y-4">
                {topProductos.map((p, i) => {
                  const maxTotal = topProductos[0]?.total || 1
                  const pct = (p.total / maxTotal) * 100
                  const [c1, c2] = GRADIENT_COLORS[i % GRADIENT_COLORS.length]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                            : i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                            : i === 2 ? 'linear-gradient(135deg, #b45309, #92400e)'
                            : 'rgba(255,255,255,0.06)',
                          color: i < 3 ? '#fff' : '#52525b'
                        }}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {i + 1}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-semibold text-white truncate">{p.nombre}</span>
                          <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: c1 }}>{fmt(p.total)}</span>
                        </div>
                        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: i * 0.06 + 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                            style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, boxShadow: `0 0 8px ${c1}55` }}
                          />
                        </div>
                        <span className="text-xs text-muted mt-1 block">{fmtNum(p.cantidad)} unidades</span>
                      </div>
                    </motion.div>
                  )
                })}
                {topProductos.length === 0 && <EmptyState />}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB: CATEGORÍAS */}
        {tab === 'categorias' && (
          <motion.div
            key="categorias"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Distribución por Categoría" />
              {ventasPorCategoria.length === 0 ? <EmptyState /> : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          {COLORS.map((c, i) => (
                            <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={c} stopOpacity={1} />
                              <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                            </radialGradient>
                          ))}
                        </defs>
                        <Pie
                          data={ventasPorCategoria} dataKey="total" nameKey="nombre"
                          cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                          paddingAngle={3} strokeWidth={0}
                        >
                          {ventasPorCategoria.map((_, i) => (
                            <Cell key={i} fill={`url(#pieGrad${i % COLORS.length})`} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {ventasPorCategoria.map((c, i) => {
                      const total = ventasPorCategoria.reduce((s, x) => s + x.total, 0)
                      const pct = total ? (c.total / total * 100) : 0
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-muted flex-1">{c.nombre}</span>
                          <span className="text-sm font-bold text-white">{fmt(c.total)}</span>
                          <span className="text-xs text-muted w-9 text-right">{pct.toFixed(0)}%</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Ventas por Categoría" subtitle="Comparativa de ingresos" />
              {ventasPorCategoria.length === 0 ? <EmptyState /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasPorCategoria} barSize={32} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                      <XAxis dataKey="nombre" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {ventasPorCategoria.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {ventasPorCategoria.slice(0, 4).map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 + 0.3 }}
                    className="p-3 rounded-xl"
                    style={{
                      background: `${COLORS[i % COLORS.length]}11`,
                      border: `1px solid ${COLORS[i % COLORS.length]}22`
                    }}
                  >
                    <p className="text-xs text-muted mb-1">{c.nombre}</p>
                    <p className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{fmt(c.total)}</p>
                    <p className="text-xs text-muted">{fmtNum(c.cantidad)} uds</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB: MÉTODOS DE PAGO */}
        {tab === 'pagos' && (
          <motion.div
            key="pagos"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Distribución de Pagos" />
              {ventasPorMetodo.length === 0 ? <EmptyState /> : (
                <>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ventasPorMetodo} dataKey="total" nameKey="nombre"
                          cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                          paddingAngle={4} strokeWidth={0}
                        >
                          {ventasPorMetodo.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {ventasPorMetodo.map((m, i) => {
                      const total = ventasPorMetodo.reduce((s, x) => s + x.total, 0)
                      const pct = total ? (m.total / total * 100) : 0
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-muted flex-1">{m.nombre}</span>
                          <span className="text-xs text-muted">{m.count} pagos</span>
                          <span className="text-sm font-bold text-white w-20 text-right">{fmt(m.total)}</span>
                          <span className="text-xs text-muted w-9 text-right">{pct.toFixed(0)}%</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Resumen por Método" subtitle="Participación en el total" />
              <div className="space-y-5">
                {ventasPorMetodo.map((m, i) => {
                  const total = ventasPorMetodo.reduce((s, x) => s + x.total, 0)
                  const pct = total ? (m.total / total * 100) : 0
                  const [c1, c2] = GRADIENT_COLORS[i % GRADIENT_COLORS.length]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                            style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}22)`, border: `1px solid ${c1}33` }}
                          >💳</div>
                          <span className="text-sm font-semibold text-white">{m.nombre}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: c1 }}>{fmt(m.total)}</p>
                          <p className="text-xs text-muted">{m.count} transacciones</p>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                          style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, boxShadow: `0 0 10px ${c1}44` }}
                        />
                      </div>
                      <p className="text-xs text-muted mt-1">{pct.toFixed(1)}% del total recaudado</p>
                    </motion.div>
                  )
                })}
                {ventasPorMetodo.length === 0 && <EmptyState />}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* TAB: INVENTARIO */}
        {tab === 'inventario' && (
          <motion.div
            key="inventario"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard index={0} icon={Package}    label="Total Productos"  value={fmtNum(state.productos.filter(p => p.activo).length)}                                                   gradientFrom="#6366f1" gradientTo="#8b5cf6" />
              <KpiCard index={1} icon={RefreshCw}  label="Stock Bajo"       value={fmtNum(stockBajo.length)}       sub="Requieren reabasto"                                               gradientFrom="#f59e0b" gradientTo="#f97316" />
              <KpiCard index={2} icon={TrendingUp} label="Valor Inventario" value={fmt(state.productos.filter(p => p.activo).reduce((s, p) => s + p.stock * p.precio_compra, 0))}         gradientFrom="#22c55e" gradientTo="#10b981" />
              <KpiCard index={3} icon={DollarSign} label="Valor a PVP"      value={fmt(state.productos.filter(p => p.activo).reduce((s, p) => s + p.stock * p.precio_venta, 0))}          gradientFrom="#06b6d4" gradientTo="#0ea5e9" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <SectionHeader title="Valor de Inventario por Categoría" subtitle="Basado en precio de compra × stock actual" />
              {(() => {
                const catData = {}
                state.productos.filter(p => p.activo).forEach(p => {
                  const cat = getCategory(p.categoria_id)
                  const key = cat?.nombre || 'Sin categoría'
                  catData[key] = (catData[key] || 0) + p.stock * p.precio_compra
                })
                const data = Object.entries(catData)
                  .map(([nombre, valor]) => ({ nombre, valor: +valor.toFixed(2) }))
                  .sort((a, b) => b.valor - a.valor)
                return (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} barSize={32} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                        <XAxis dataKey="nombre" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              })()}
            </motion.div>

            {stockBajo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-warning"
                      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <h3 className="text-sm font-semibold text-white">Alertas de Stock ({stockBajo.length})</h3>
                  </div>
                  <motion.button
                    onClick={exportarInventario}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/6 border border-white/8 text-muted cursor-pointer"
                  >
                    <FileDown className="w-3 h-3" /> Exportar
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/6">
                        {['Producto', 'SKU', 'Stock', 'Mínimo', 'Estado'].map(h => (
                          <th key={h} className={`py-2 px-3 text-xs font-semibold text-muted uppercase tracking-widest ${['Stock', 'Mínimo', 'Estado'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stockBajo.map((p, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-white/4"
                        >
                          <td className="py-2.5 px-3 text-sm font-semibold text-white">{p['Producto']}</td>
                          <td className="py-2.5 px-3 font-mono text-xs text-muted">{p['SKU']}</td>
                          <td className="py-2.5 px-3 text-right text-sm font-bold text-danger">{p['Stock Actual']}</td>
                          <td className="py-2.5 px-3 text-right text-xs text-muted">{p['Stock Mínimo']}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                              p['Estado'] === 'SIN STOCK'
                                ? 'bg-danger/15 text-danger border border-danger/25'
                                : 'bg-warning/15 text-warning border border-warning/25'
                            }`}>
                              {p['Estado']}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Inventario Completo</h3>
                  <p className="text-sm text-muted mt-0.5">{state.productos.filter(p => p.activo).length} productos activos</p>
                </div>
                <motion.button
                  onClick={exportarInventario}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/12 border border-success/20 text-success cursor-pointer"
                >
                  <FileDown className="w-3 h-3" /> Excel
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/6">
                      {['Producto', 'Categoría', 'P. Venta', 'Stock', 'Valor'].map(h => (
                        <th key={h} className={`py-2 px-3 text-xs font-semibold text-muted uppercase tracking-widest ${['P. Venta', 'Stock', 'Valor'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.productos.filter(p => p.activo).map((p, i) => {
                      const cat = getCategory(p.categoria_id)
                      const isLow = p.stock <= p.stock_minimo
                      const isOut = p.stock === 0
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/3 hover:bg-white/2 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-sm font-medium text-zinc-100">{p.nombre}</td>
                          <td className="py-2.5 px-3 text-xs text-muted">{cat?.nombre || '—'}</td>
                          <td className="py-2.5 px-3 text-right text-xs text-muted">{fmt(p.precio_venta)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`text-sm font-bold ${isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-success'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-sm font-semibold text-white">{fmt(p.stock * p.precio_compra)}</td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </div>
  )
}