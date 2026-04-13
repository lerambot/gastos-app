import { useState } from 'react'
import AddExpense from './AddExpense'

function fmt(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €'
}

function groupByDate(expenses) {
  const groups = {}
  for (const exp of expenses) {
    if (!groups[exp.date]) groups[exp.date] = []
    groups[exp.date].push(exp)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ExpenseList({ expenses, categories, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterMonth, setFilterMonth] = useState('all')

  const currentMonth = new Date().toISOString().slice(0, 7)

  function getCategoryLabel(exp) {
    if (exp.type === 'income') return `💰 Ingreso`
    const cat = categories.find(c => c.id === exp.categoryId)
    if (!cat) return 'Desconocida'
    if (exp.subcategoryId) {
      const sub = cat.subcategories?.find(s => s.id === exp.subcategoryId)
      return `${cat.icon} ${cat.name} › ${sub?.name ?? exp.subcategoryId}`
    }
    return `${cat.icon} ${cat.name}`
  }

  const filtered = expenses.filter(e => {
    if (filterMonth === 'current' && !e.date.startsWith(currentMonth)) return false
    if (filterCat && e.categoryId !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      const catLabel = getCategoryLabel(e).toLowerCase()
      if (!catLabel.includes(q) && !e.description?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const grouped = groupByDate(sorted)

  return (
    <>
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar..."
          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <div className="flex gap-2">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          >
            <option value="all">Todos los meses</option>
            <option value="current">Este mes</option>
          </select>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <div className="text-5xl mb-4">{expenses.length === 0 ? '💸' : '🔍'}</div>
          <p className="text-lg">{expenses.length === 0 ? 'Sin gastos todavía' : 'Sin resultados'}</p>
          <p className="text-sm mt-1">{expenses.length === 0 ? 'Pulsa + para añadir el primero' : 'Prueba con otros filtros'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-32">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-4 mb-2 capitalize">
                {formatDate(date)}
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
                {items.map((exp, i) => (
                  <div
                    key={exp.id}
                    className={`flex items-center justify-between px-4 py-3 ${i < items.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {getCategoryLabel(exp)}
                        </p>
                        {exp.recurring && (
                          <span className="text-xs text-indigo-400 shrink-0">🔁</span>
                        )}
                        {exp.recurringId && (
                          <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">🔁</span>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{exp.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className={`font-semibold ${exp.type === 'income' ? 'text-emerald-500' : 'text-gray-800 dark:text-white'}`}>
                        {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                      </span>
                      <button
                        onClick={() => setEditing(exp)}
                        className="text-indigo-400 text-sm px-2 py-1 rounded-lg active:bg-indigo-50 dark:active:bg-indigo-900/30"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setConfirmDelete(exp)}
                        className="text-red-400 text-sm px-2 py-1 rounded-lg active:bg-red-50 dark:active:bg-red-900/30"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AddExpense
          categories={categories}
          expense={editing}
          onSave={updated => { onUpdate(updated); setEditing(null) }}
          onCancel={() => setEditing(null)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">¿Eliminar entrada?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {getCategoryLabel(confirmDelete)} — {fmt(confirmDelete.amount)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl py-3 text-gray-600 dark:text-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
