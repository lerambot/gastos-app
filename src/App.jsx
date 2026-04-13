import { useState, useEffect } from 'react'
import { useStorage } from './hooks/useStorage'
import { defaultCategories } from './data/defaultCategories'
import { exportToCsv } from './utils/exportCsv'
import AddExpense from './components/AddExpense'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import Categories from './components/Categories'
import Budgets from './components/Budgets'

const TABS = [
  { id: 'gastos', label: 'Gastos', icon: '💸' },
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'presupuesto', label: 'Presupuesto', icon: '🎯' },
  { id: 'categorias', label: 'Categorías', icon: '🏷️' },
]

export default function App() {
  const [expenses, setExpenses] = useStorage('gastos_expenses', [])
  const [categories, setCategories] = useStorage('gastos_categories', defaultCategories)
  const [darkMode, setDarkMode] = useStorage('gastos_dark', false)
  const [budgets, setBudgets] = useStorage('gastos_budgets', [])
  const [tab, setTab] = useState('gastos')
  const [showAdd, setShowAdd] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Auto-generate recurring expenses for current month
  useEffect(() => {
    setExpenses(prev => {
      const templates = prev.filter(e => e.recurring === true && !e.recurringId)
      const toAdd = []
      for (const template of templates) {
        const templateMonth = template.date.slice(0, 7)
        if (templateMonth >= currentMonth) continue
        const recurringId = `rec_${template.id}_${currentMonth}`
        const alreadyExists = prev.some(e => e.id === recurringId)
        if (!alreadyExists) {
          const newDate = currentMonth + template.date.slice(7)
          toAdd.push({
            ...template,
            id: recurringId,
            recurringId: template.id,
            recurring: false,
            date: newDate,
          })
        }
      }
      return toAdd.length > 0 ? [...toAdd, ...prev] : prev
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const monthEntries = expenses.filter(e => e.date.startsWith(currentMonth))
  const monthIncome = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const monthExpenses = monthEntries.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0)
  const monthBalance = monthIncome - monthExpenses

  function addExpense(exp) {
    setExpenses(prev => [exp, ...prev])
    setShowAdd(false)
  }

  function updateExpense(updated) {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  function handleExportCsv() {
    const monthExp = expenses.filter(e => e.date.startsWith(currentMonth))
    exportToCsv(monthExp, categories, `gastos-${currentMonth}.csv`)
  }

  return (
    <div className={`flex flex-col min-h-svh bg-slate-100 dark:bg-slate-900${darkMode ? ' dark' : ''}`}>
      <header className="bg-indigo-500 text-white px-4 pt-10 pb-5">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold">Gastos del Hogar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg px-2 py-1 font-medium"
            >
              CSV
            </button>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="text-xl w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-indigo-200 text-xs mb-0.5">Ingresos</p>
            <p className="text-white font-semibold text-sm">{monthIncome.toFixed(2).replace('.', ',')} €</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2">
            <p className="text-indigo-200 text-xs mb-0.5">Gastos</p>
            <p className="text-white font-semibold text-sm">{monthExpenses.toFixed(2).replace('.', ',')} €</p>
          </div>
          <div className={`rounded-xl py-2 ${monthBalance >= 0 ? 'bg-emerald-400/30' : 'bg-red-400/30'}`}>
            <p className="text-indigo-100 text-xs mb-0.5">Balance</p>
            <p className="text-white font-semibold text-sm">
              {monthBalance >= 0 ? '+' : ''}{monthBalance.toFixed(2).replace('.', ',')} €
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 overflow-y-auto pb-24">
        {tab === 'gastos' && (
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
          />
        )}
        {tab === 'resumen' && (
          <Summary expenses={expenses} categories={categories} />
        )}
        {tab === 'presupuesto' && (
          <Budgets
            categories={categories}
            budgets={budgets}
            onBudgetsChange={setBudgets}
            expenses={expenses}
          />
        )}
        {tab === 'categorias' && (
          <Categories categories={categories} onChange={setCategories} />
        )}
      </main>

      {tab === 'gastos' && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-indigo-500 text-white text-3xl rounded-full shadow-lg flex items-center justify-center active:bg-indigo-600 z-40"
        >
          +
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex max-w-[480px] mx-auto w-full z-30">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${tab === t.id ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {showAdd && (
        <AddExpense
          categories={categories}
          onSave={addExpense}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
