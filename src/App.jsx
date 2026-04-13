import { useState } from 'react'
import { useStorage } from './hooks/useStorage'
import { defaultCategories } from './data/defaultCategories'
import AddExpense from './components/AddExpense'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import Categories from './components/Categories'

const TABS = [
  { id: 'gastos', label: 'Gastos', icon: '💸' },
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'categorias', label: 'Categorías', icon: '🏷️' },
]

export default function App() {
  const [expenses, setExpenses] = useStorage('gastos_expenses', [])
  const [categories, setCategories] = useStorage('gastos_categories', defaultCategories)
  const [tab, setTab] = useState('gastos')
  const [showAdd, setShowAdd] = useState(false)

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthEntries = expenses.filter(e => e.date.startsWith(thisMonth))
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

  return (
    <div className="flex flex-col min-h-svh bg-slate-100">
      <header className="bg-indigo-500 text-white px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold mb-3">Gastos del Hogar</h1>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex max-w-[480px] mx-auto w-full z-30">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${tab === t.id ? 'text-indigo-500' : 'text-gray-400'}`}
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
