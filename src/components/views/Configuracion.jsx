import { useState } from 'react'
import { usePOS } from '../../context/POSContext'
import {
  Users,
  Tags,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Shield,
  UserCircle,
  Banknote,
  Wallet,
  ArrowLeftRight,
  Ticket
} from 'lucide-react'

const tabs = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'categorias', label: 'Categorías', icon: Tags },
  { id: 'metodosPago', label: 'Métodos de Pago', icon: CreditCard }
]

const paymentIcons = {
  Banknote: Banknote,
  CreditCard: CreditCard,
  Wallet: Wallet,
  ArrowLeftRight: ArrowLeftRight,
  Ticket: Ticket
}

export default function Configuracion() {
  const { state, hasPermission } = usePOS()
  const [activeTab, setActiveTab] = useState('usuarios')
  
  const isAdmin = hasPermission('configuracion')
  
  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Shield className="w-16 h-16 text-muted mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Acceso Restringido</h2>
        <p className="text-muted">Solo los administradores pueden acceder a esta sección.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-muted">Administra usuarios, categorías y métodos de pago</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
                  : 'bg-surface border border-border text-zinc-400 hover:text-white hover:border-border-light'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'usuarios' && <UsuariosTab />}
        {activeTab === 'categorias' && <CategoriasTab />}
        {activeTab === 'metodosPago' && <MetodosPagoTab />}
      </div>
    </div>
  )
}

// Usuarios Tab
function UsuariosTab() {
  const { state, dispatch, getRole, addToast } = usePOS()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSave = async (userData) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingUser) {
      dispatch({ type: 'UPDATE_USER', payload: { ...userData, id: editingUser.id } })
      addToast('Usuario actualizado correctamente', 'success')
    } else {
      dispatch({ type: 'ADD_USER', payload: userData })
      addToast('Usuario creado correctamente', 'success')
    }
    
    setShowModal(false)
    setEditingUser(null)
    setLoading(false)
  }
  
  const handleDelete = async (userId) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: 'DELETE_USER', payload: userId })
    addToast('Usuario eliminado correctamente', 'success')
    setShowDeleteConfirm(null)
    setLoading(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted">{state.usuarios.length} usuarios registrados</p>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true) }}
          className="btn-gradient px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.usuarios.map((user) => {
          const role = getRole(user.rol_id)
          return (
            <div key={user.id} className="glass rounded-xl p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-semibold">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.nombre}</p>
                    <p className="text-sm text-muted">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingUser(user); setShowModal(true) }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(user)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                  {role?.nombre}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.activo ? 'bg-success/20 text-success' : 'bg-zinc-500/20 text-zinc-500'
                }`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          roles={state.roles}
          onClose={() => { setShowModal(false); setEditingUser(null) }}
          onSave={handleSave}
          loading={loading}
        />
      )}
      
      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar a ${showDeleteConfirm.nombre}?`}
          onConfirm={() => handleDelete(showDeleteConfirm.id)}
          onClose={() => setShowDeleteConfirm(null)}
          loading={loading}
        />
      )}
    </div>
  )
}

// User Modal
function UserModal({ user, roles, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: user?.password || '',
    rol_id: user?.rol_id || roles[0]?.id || 1,
    activo: user?.activo ?? true,
    avatar: user?.avatar || ''
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const avatar = formData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    onSave({ ...formData, avatar, rol_id: parseInt(formData.rol_id) })
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors"
              required={!user}
              placeholder={user ? '••••••••' : ''}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Rol</label>
            <select
              value={formData.rol_id}
              onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm text-zinc-400">Usuario activo</span>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 btn-gradient rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Categorias Tab
function CategoriasTab() {
  const { state, dispatch, addToast } = usePOS()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSave = async (categoryData) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...categoryData, id: editingCategory.id } })
      addToast('Categoría actualizada correctamente', 'success')
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: categoryData })
      addToast('Categoría creada correctamente', 'success')
    }
    
    setShowModal(false)
    setEditingCategory(null)
    setLoading(false)
  }
  
  const handleDelete = async (categoryId) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId })
    addToast('Categoría eliminada correctamente', 'success')
    setShowDeleteConfirm(null)
    setLoading(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted">{state.categorias.length} categorías registradas</p>
        <button
          onClick={() => { setEditingCategory(null); setShowModal(true) }}
          className="btn-gradient px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {state.categorias.map((category) => {
          const productCount = state.productos.filter(p => p.categoria_id === category.id).length
          return (
            <div key={category.id} className="glass rounded-xl p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${category.color}20` }}>
                  {category.emoji}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingCategory(category); setShowModal(true) }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(category)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-white">{category.nombre}</p>
              <p className="text-sm text-muted">{productCount} productos</p>
            </div>
          )
        })}
      </div>
      
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => { setShowModal(false); setEditingCategory(null) }}
          onSave={handleSave}
          loading={loading}
        />
      )}
      
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${showDeleteConfirm.nombre}"?`}
          onConfirm={() => handleDelete(showDeleteConfirm.id)}
          onClose={() => setShowDeleteConfirm(null)}
          loading={loading}
        />
      )}
    </div>
  )
}

// Category Modal
function CategoryModal({ category, onClose, onSave, loading }) {
  const emojis = ['📦', '🍕', '🥤', '🧹', '📱', '👕', '🎮', '📚', '💊', '🔧', '🎁', '🏠']
  const colors = ['#6366f1', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#ef4444', '#f97316']
  
  const [formData, setFormData] = useState({
    nombre: category?.nombre || '',
    emoji: category?.emoji || '📦',
    color: category?.color || '#6366f1'
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.emoji === emoji
                      ? 'bg-primary/20 border-2 border-primary scale-110'
                      : 'bg-surface-light border border-border hover:border-border-light'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 btn-gradient rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Metodos Pago Tab
function MetodosPagoTab() {
  const { state, dispatch, addToast } = usePOS()
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSave = async (methodData) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingMethod) {
      dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: { ...methodData, id: editingMethod.id } })
      addToast('Método de pago actualizado correctamente', 'success')
    } else {
      dispatch({ type: 'ADD_PAYMENT_METHOD', payload: methodData })
      addToast('Método de pago creado correctamente', 'success')
    }
    
    setShowModal(false)
    setEditingMethod(null)
    setLoading(false)
  }
  
  const handleDelete = async (methodId) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: methodId })
    addToast('Método de pago eliminado correctamente', 'success')
    setShowDeleteConfirm(null)
    setLoading(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted">{state.metodosPago.length} métodos de pago</p>
        <button
          onClick={() => { setEditingMethod(null); setShowModal(true) }}
          className="btn-gradient px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Método
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {state.metodosPago.map((method) => {
          const Icon = paymentIcons[method.icono] || CreditCard
          return (
            <div key={method.id} className="glass rounded-xl p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingMethod(method); setShowModal(true) }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(method)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-white">{method.nombre}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted capitalize">{method.tipo}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  method.activo ? 'bg-success/20 text-success' : 'bg-zinc-500/20 text-zinc-500'
                }`}>
                  {method.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      {showModal && (
        <PaymentMethodModal
          method={editingMethod}
          onClose={() => { setShowModal(false); setEditingMethod(null) }}
          onSave={handleSave}
          loading={loading}
        />
      )}
      
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Eliminar Método de Pago"
          message={`¿Estás seguro de que deseas eliminar "${showDeleteConfirm.nombre}"?`}
          onConfirm={() => handleDelete(showDeleteConfirm.id)}
          onClose={() => setShowDeleteConfirm(null)}
          loading={loading}
        />
      )}
    </div>
  )
}

// Payment Method Modal
function PaymentMethodModal({ method, onClose, onSave, loading }) {
  const iconOptions = ['Banknote', 'CreditCard', 'Wallet', 'ArrowLeftRight', 'Ticket']
  const typeOptions = ['efectivo', 'electronico', 'credito', 'vale']
  
  const [formData, setFormData] = useState({
    nombre: method?.nombre || '',
    tipo: method?.tipo || 'efectivo',
    icono: method?.icono || 'Banknote',
    activo: method?.activo ?? true
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {method ? 'Editar Método' : 'Nuevo Método'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer capitalize"
            >
              {typeOptions.map((tipo) => (
                <option key={tipo} value={tipo} className="capitalize">{tipo}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((iconName) => {
                const Icon = paymentIcons[iconName]
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icono: iconName })}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      formData.icono === iconName
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-surface-light border border-border hover:border-border-light'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${formData.icono === iconName ? 'text-primary' : 'text-zinc-400'}`} />
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm text-zinc-400">Método activo</span>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 btn-gradient rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirm Modal
function DeleteConfirmModal({ title, message, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-muted">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-danger rounded-xl text-white font-medium hover:bg-danger/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
