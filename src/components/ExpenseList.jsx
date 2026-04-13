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

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  const grouped = groupByDate(sorted)

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-5xl mb-4">💸</div>
        <p className="text-lg">Sin gastos todavía</p>
        <p className="text-sm mt-1">Pulsa + para añadir el primero</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 pb-32">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2 capitalize">
              {formatDate(date)}
            </p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {items.map((exp, i) => (
                <div
                  key={exp.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {getCategoryLabel(exp)}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-400 truncate">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className={`font-semibold ${exp.type === 'income' ? 'text-emerald-500' : 'text-gray-800'}`}>
                      {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                    </span>
                    <button
                      onClick={() => setEditing(exp)}
                      className="text-indigo-400 text-sm px-2 py-1 rounded-lg active:bg-indigo-50"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setConfirmDelete(exp)}
                      className="text-red-400 text-sm px-2 py-1 rounded-lg active:bg-red-50"
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar gasto?</h3>
            <p className="text-gray-500 mb-6">
              {getCategoryLabel(confirmDelete)} — {fmt(confirmDelete.amount)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-600 font-medium"
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
