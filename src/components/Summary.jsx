import { useState } from 'react'
import Charts from './Charts'
import { exportToCsv } from '../utils/exportCsv'

function fmt(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €'
}

function getWeekRange(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return {
    start: mon.toISOString().split('T')[0],
    end: sun.toISOString().split('T')[0],
  }
}

function getMonthRange(date) {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

function formatMonthLabel(date) {
  return new Date(date + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

function formatWeekLabel(start, end) {
  const s = new Date(start + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const e = new Date(end + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return `${s} – ${e}`
}

export default function Summary({ expenses, categories }) {
  const [mode, setMode] = useState('monthly')
  const [view, setView] = useState('resumen')
  const today = new Date().toISOString().split('T')[0]
  const [refDate, setRefDate] = useState(today)

  const range = mode === 'weekly' ? getWeekRange(refDate) : getMonthRange(refDate)

  const filtered = expenses.filter(e => e.date >= range.start && e.date <= range.end)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  function navigate(dir) {
    const d = new Date(refDate + 'T12:00:00')
    if (mode === 'weekly') {
      d.setDate(d.getDate() + dir * 7)
    } else {
      d.setMonth(d.getMonth() + dir)
    }
    setRefDate(d.toISOString().split('T')[0])
  }

  const periodLabel = mode === 'weekly'
    ? formatWeekLabel(range.start, range.end)
    : formatMonthLabel(range.start)

  const totalIncome = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpenses = filtered.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpenses

  const byCat = {}
  for (const exp of filtered) {
    if (exp.type === 'income') continue
    const cat = categories.find(c => c.id === exp.categoryId)
    if (!cat) continue
    if (!byCat[cat.id]) byCat[cat.id] = { cat, total: 0, subs: {} }
    byCat[cat.id].total += exp.amount
    if (exp.subcategoryId) {
      const sub = cat.subcategories?.find(s => s.id === exp.subcategoryId)
      const subName = sub?.name ?? exp.subcategoryId
      byCat[cat.id].subs[subName] = (byCat[cat.id].subs[subName] ?? 0) + exp.amount
    }
  }

  const sorted = Object.values(byCat).sort((a, b) => b.total - a.total)

  function handleExport() {
    const label = mode === 'weekly' ? range.start : range.start.slice(0, 7)
    exportToCsv(filtered, categories, `gastos-${label}.csv`)
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('weekly')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${mode === 'weekly' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
          >
            Semanal
          </button>
          <button
            onClick={() => setMode('monthly')}
            className={`flex-1 py-2 rounded-xl font-medium text-sm transition-colors ${mode === 'monthly' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
          >
            Mensual
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-2xl px-3 py-2 text-gray-400 dark:text-gray-500 active:text-gray-600">‹</button>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize font-medium">{periodLabel}</p>
          <button onClick={() => navigate(1)} className="text-2xl px-3 py-2 text-gray-400 dark:text-gray-500 active:text-gray-600">›</button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl py-3">
            <p className="text-xs text-emerald-600 font-medium mb-1">Ingresos</p>
            <p className="text-base font-bold text-emerald-600">{fmt(totalIncome)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl py-3">
            <p className="text-xs text-red-500 font-medium mb-1">Gastos</p>
            <p className="text-base font-bold text-red-500">{fmt(totalExpenses)}</p>
          </div>
          <div className={`rounded-xl py-3 ${balance >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
            <p className={`text-xs font-medium mb-1 ${balance >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>Balance</p>
            <p className={`text-base font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
              {balance >= 0 ? '+' : ''}{fmt(balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setView('resumen')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${view === 'resumen' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setView('graficos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${view === 'graficos' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
            >
              📈 Gráficos
            </button>
          </div>
          <button
            onClick={handleExport}
            className="text-xs text-indigo-500 font-medium px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 active:bg-indigo-100"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {view === 'graficos' ? (
        <Charts byCat={byCat} expenses={expenses} categories={categories} />
      ) : (
        <>
          {sorted.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12">
              <p className="text-4xl mb-3">📭</p>
              <p>Sin gastos en este período</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {sorted.map((item, i) => {
                const pct = total > 0 ? (item.total / total) * 100 : 0
                return (
                  <div key={item.cat.id} className={i < sorted.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''}>
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.cat.icon}</span>
                          <span className="font-medium text-gray-800 dark:text-white">{item.cat.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{pct.toFixed(0)}%</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">{fmt(item.total)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {Object.entries(item.subs).map(([subName, subTotal]) => {
                      const subPct = total > 0 ? (subTotal / total) * 100 : 0
                      return (
                        <div key={subName} className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-700">
                          <span className="text-sm text-gray-500 dark:text-gray-400 pl-8">› {subName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{subPct.toFixed(0)}%</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{fmt(subTotal)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
