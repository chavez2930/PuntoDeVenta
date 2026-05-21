import { useState, useMemo } from 'react'
import { usePOS } from '../../context/POSContext'
import { formatCurrency } from '../../data/mockData'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Check,
  AlertCircle
} from 'lucide-react'

export default function Productos() {
  const { state, dispatch, getCategory, addToast } = usePOS()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const filteredProducts = useMemo(() => {
    return state.productos.filter(product => {
      const matchesSearch = search === '' ||
        product.nombre.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.codigo_barras.includes(search)
      
      const matchesCategory = selectedCategory === null || product.categoria_id === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [state.productos, search, selectedCategory])
  
  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }
  
  const handleCreate = () => {
    setEditingProduct(null)
    setShowModal(true)
  }
  
  const handleDelete = async (productId) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: 'DELETE_PRODUCT', payload: productId })
    setShowDeleteConfirm(null)
    setLoading(false)
    addToast('Producto eliminado correctamente', 'success')
  }
  
  const handleSave = async (productData) => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...productData, id: editingProduct.id } })
      addToast('Producto actualizado correctamente', 'success')
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData })
      addToast('Producto creado correctamente', 'success')
    }
    
    setShowModal(false)
    setEditingProduct(null)
    setLoading(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-muted">{state.productos.length} productos registrados</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-gradient px-4 py-2 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
          />
        </div>
        
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {state.categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.nombre}
            </option>
          ))}
        </select>
      </div>
      
      {/* Products Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 hidden md:table-cell">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400 hidden lg:table-cell">Categoría</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Precio</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Stock</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No se encontraron productos</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const category = getCategory(product.categoria_id)
                  const isLowStock = product.stock <= product.stock_minimo
                  
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-surface-light/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-xl">
                            {category?.emoji}
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.nombre}</p>
                            <p className="text-sm text-muted md:hidden">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">{product.sku}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="px-2 py-1 bg-surface-light rounded-lg text-sm text-zinc-400">
                          {category?.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-medium">
                        {formatCurrency(product.precio_venta)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock <= 0
                            ? 'bg-danger/20 text-danger'
                            : isLowStock
                              ? 'bg-warning/20 text-warning'
                              : 'bg-success/20 text-success'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.activo
                            ? 'bg-success/20 text-success'
                            : 'bg-zinc-500/20 text-zinc-500'
                        }`}>
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      
      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={state.categorias}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
          loading={loading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Eliminar Producto</h3>
                <p className="text-sm text-muted">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-6">
              ¿Estás seguro de que deseas eliminar <strong className="text-white">{showDeleteConfirm.nombre}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={loading}
                className="flex-1 py-2.5 bg-danger rounded-xl text-white font-medium hover:bg-danger/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Modal Component
function ProductModal({ product, categories, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    categoria_id: product?.categoria_id || categories[0]?.id || 1,
    codigo_barras: product?.codigo_barras || '',
    sku: product?.sku || '',
    precio_compra: product?.precio_compra || '',
    precio_venta: product?.precio_venta || '',
    impuesto_pct: product?.impuesto_pct || 16,
    stock: product?.stock || 0,
    stock_minimo: product?.stock_minimo || 5,
    unidad_medida: product?.unidad_medida || 'pza',
    activo: product?.activo ?? true
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      categoria_id: parseInt(formData.categoria_id),
      precio_compra: parseFloat(formData.precio_compra),
      precio_venta: parseFloat(formData.precio_venta),
      impuesto_pct: parseFloat(formData.impuesto_pct),
      stock: parseInt(formData.stock),
      stock_minimo: parseInt(formData.stock_minimo)
    })
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Categoría</label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Código de barras */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Código de Barras</label>
              <input
                type="text"
                value={formData.codigo_barras}
                onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Unidad de medida */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Unidad de Medida</label>
              <select
                value={formData.unidad_medida}
                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:border-primary transition-colors cursor-pointer"
              >
                <option value="pza">Pieza</option>
                <option value="kg">Kilogramo</option>
                <option value="lt">Litro</option>
                <option value="mt">Metro</option>
              </select>
            </div>
            
            {/* Precio de compra */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Precio de Compra</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_compra}
                onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Precio de venta */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Precio de Venta</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Impuesto */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Impuesto (%)</label>
              <input
                type="number"
                value={formData.impuesto_pct}
                onChange={(e) => setFormData({ ...formData, impuesto_pct: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Stock mínimo */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Stock Mínimo</label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Activo */}
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
              <span className="text-sm text-zinc-400">Producto activo</span>
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-light border border-border rounded-xl text-white font-medium hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 btn-gradient rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
