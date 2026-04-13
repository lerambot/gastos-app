import { useState } from 'react'

function fmt(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €'
}

export default function Budgets({ categories, budgets, onBudgetsChange, expenses }) {
  const [editing, setEditing] = useState(null)
  const [inputVal, setInputVal] = useState('')

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthExpenses = expenses.filter(e => e.type !== 'income' && e.date.startsWith(currentMonth))

  function getSpent(catId) {
    return monthExpenses
      .filter(e => e.categoryId === catId)
      .reduce((s, e) => s + e.amount, 0)
  }

  function getBudget(catId) {
    const found = budgets.find(b => b.categoryId === catId)
    return found ? found.amount : null
  }

  function saveBudget(catId) {
    const val = parseFloat(inputVal)
    if (isNaN(val) || val < 0) {
      setEditing(null)
      setInputVal('')
      return
    }
    const existing = budgets.find(b => b.categoryId === catId)
    if (existing) {
      onBudgetsChange(budgets.map(b => b.categoryId === catId ? { ...b, amount: val } : b))
    } else {
      onBudgetsChange([...budgets, { categoryId: catId, amount: val }])
    }
    setEditing(null)
    setInputVal('')
  }

  function removeBudget(catId) {
    onBudgetsChange(budgets.filter(b => b.categoryId !== catId))
  }

  function startEdit(catId) {
    const current = getBudget(catId)
    setEditing(catId)
    setInputVal(current !== null ? String(current) : '')
  }

  return (
    <div className="flex flex-col gap-3 pb-32">
      <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
        Presupuestos mensuales — {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
      </p>

      {categories.map(cat => {
        const spent = getSpent(cat.id)
        const budget = getBudget(cat.id)
        const hasBudget = budget !== null
        const pct = hasBudget && budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
        const over = hasBudget && spent > budget
        const warn = hasBudget && !over && pct > 80
        const remaining = hasBudget ? budget - spent : 0

        let barColor = 'bg-emerald-400'
        if (over) barColor = 'bg-red-500'
        else if (warn) barColor = 'bg-amber-400'

        return (
          <div key={cat.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-medium text-gray-800 dark:text-white">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {hasBudget && (
                  <button
                    onClick={() => removeBudget(cat.id)}
                    className="text-xs text-gray-400 dark:text-gray-500 px-1"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={() => startEdit(cat.id)}
                  className="text-xs text-indigo-500 font-medium px-2 py-1 rounded-lg active:bg-indigo-50 dark:active:bg-indigo-900/30"
                >
                  {hasBudget ? 'Editar' : 'Establecer'}
                </button>
              </div>
            </div>

            {editing === cat.id && (
              <div className="flex gap-2 mb-3">
                <input
                  autoFocus
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveBudget(cat.id)}
                  placeholder="Presupuesto (€)"
                  className="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                />
                <button
                  onClick={() => saveBudget(cat.id)}
                  className="bg-indigo-500 text-white rounded-xl px-3 py-2 text-sm font-medium"
                >
                  OK
                </button>
                <button
                  onClick={() => { setEditing(null); setInputVal('') }}
                  className="text-gray-400 dark:text-gray-500 px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {hasBudget ? (
              <>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Gastado <span className="font-medium text-gray-700 dark:text-gray-200">{fmt(spent)}</span>
                    {' / '}
                    <span className="font-medium text-gray-700 dark:text-gray-200">{fmt(budget)}</span>
                  </span>
                  {over ? (
                    <span className="text-red-500 font-semibold">
                      ¡Superado por {fmt(Math.abs(remaining))}!
                    </span>
                  ) : (
                    <span className={warn ? 'text-amber-500 font-medium' : 'text-emerald-500 font-medium'}>
                      Queda {fmt(remaining)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Sin presupuesto — gastado este mes: <span className="font-medium">{fmt(spent)}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
