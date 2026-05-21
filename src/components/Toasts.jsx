import { usePOS } from '../context/POSContext'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const colors = {
  success: 'bg-success/20 border-success/30 text-success',
  error: 'bg-danger/20 border-danger/30 text-danger',
  warning: 'bg-warning/20 border-warning/30 text-warning',
  info: 'bg-primary/20 border-primary/30 text-primary'
}

export default function Toasts() {
  const { state, dispatch } = usePOS()
  
  if (state.toasts.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {state.toasts.map((toast) => {
        const Icon = icons[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md animate-slide-up ${colors[toast.type] || colors.info}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
