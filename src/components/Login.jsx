import { useState, useEffect } from 'react'
import { usePOS } from '../context/POSContext'
import { Store, Eye, EyeOff, Loader2, ShoppingCart, Package, CreditCard, BarChart3, Wallet, Tag, Receipt, Truck, Box, Percent, Mail, Lock, Sun, Moon } from 'lucide-react'

const floatingIcons = [
  ShoppingCart, Package, CreditCard, BarChart3, Wallet,
  Tag, Receipt, Truck, Box, Percent, Store, ShoppingCart, Package
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return '¡Buenos días! 🌤️'
  if (hour >= 12 && hour < 19) return '¡Buenas tardes! ☀️'
  return '¡Buenas noches! 🌙'
}

export default function Login() {
  const { state, dispatch, addToast } = usePOS()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [icons, setIcons] = useState([])

  const isDark = state.theme === 'dark'

  // Cargar credenciales guardadas al montar
  useEffect(() => {
    const savedEmail = localStorage.getItem('pos-remembered-email')
    const savedRemember = localStorage.getItem('pos-remember-me') === 'true'
    if (savedRemember && savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    const generated = Array.from({ length: 35 }, (_, i) => {
      const Icon = floatingIcons[i % floatingIcons.length]
      return {
        Icon,
        left: Math.random() * 98,
        duration: 12 + Math.random() * 14,
        delay: -(Math.random() * 28),
        size: 20 + Math.random() * 18,
        id: i
      }
    })
    setIcons(generated)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const user = state.usuarios.find(u => u.email === email && u.password === password && u.activo)
    if (user) {
      if (rememberMe) {
        localStorage.setItem('pos-remembered-email', email)
        localStorage.setItem('pos-remember-me', 'true')
      } else {
        localStorage.removeItem('pos-remembered-email')
        localStorage.removeItem('pos-remember-me')
      }
      dispatch({ type: 'LOGIN', payload: user })
      addToast(`Bienvenido, ${user.nombre}`, 'success')
    } else {
      addToast('Credenciales incorrectas', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          5%   { opacity: 0.22; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
        }
      `}</style>

      {/* Theme toggle - esquina superior derecha */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-xl glass border border-border text-muted hover:text-white transition-all duration-200 hover:scale-105"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {isDark
          ? <Sun className="w-5 h-5 text-yellow-400" />
          : <Moon className="w-5 h-5 text-indigo-500" />
        }
      </button>

      {/* Floating icons */}
      {icons.map(({ Icon, left, duration, delay, size, id }) => (
        <div
          key={id}
          className="absolute pointer-events-none text-primary"
          style={{
            left: `${left}%`,
            bottom: '-5%',
            zIndex: 20,
            animation: `floatUp ${duration}s ${delay}s linear infinite`,
            opacity: 0,
          }}
        >
          <Icon size={size} />
        </div>
      ))}

      {/* Card */}
      <div className="w-full max-w-md relative z-30">
        <div className="glass rounded-2xl p-8 shadow-2xl animate-scale-in">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">POS System</h1>
            <p className="text-muted mt-1 text-sm">{getGreeting()}</p>
          </div>

          <h2 className="text-xl font-semibold text-white mb-6 text-center">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-white placeholder-zinc-600 focus:border-primary transition-all duration-200"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-xl text-white placeholder-zinc-600 focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Recordar usuario */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200 shrink-0 ${
                  rememberMe
                    ? 'bg-primary border-primary'
                    : 'bg-transparent border-zinc-600 hover:border-zinc-400'
                }`}
                aria-label="Recordar usuario"
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className="text-sm text-zinc-400 cursor-pointer select-none hover:text-zinc-300 transition-colors"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Recordar mi usuario
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Iniciando...</>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted mb-3 text-center">Credenciales de prueba:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Admin:</span>
                <span className="text-zinc-300">admin@pos.com / admin123</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Cajero:</span>
                <span className="text-zinc-300">cajero@pos.com / cajero123</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Supervisor:</span>
                <span className="text-zinc-300">supervisor@pos.com / super123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}