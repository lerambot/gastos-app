import { useState } from 'react'

export default function AddExpense({ categories, onSave, onCancel, expense }) {
  const today = new Date().toISOString().split('T')[0]

  const [type, setType] = useState(expense?.type ?? 'expense')
  const [form, setForm] = useState({
    amount: expense?.amount ?? '',
    categoryId: expense?.categoryId ?? '',
    subcategoryId: expense?.subcategoryId ?? '',
    description: expense?.description ?? '',
    date: expense?.date ?? today,
  })

  const selectedCategory = categories.find(c => c.id === form.categoryId)
  const isIncome = type === 'income'

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'categoryId') {
      setForm(f => ({ ...f, categoryId: value, subcategoryId: '' }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || !form.date) return
    if (!isIncome && !form.categoryId) return
    onSave({
      id: expense?.id ?? Date.now().toString(),
      type,
      amount: parseFloat(form.amount),
      categoryId: isIncome ? null : form.categoryId,
      subcategoryId: isIncome ? null : (form.subcategoryId || null),
      description: form.description.trim(),
      date: form.date,
    })
  }

  const accentClass = isIncome ? 'ring-emerald-400' : 'ring-indigo-400'
  const btnClass = isIncome
    ? 'bg-emerald-500 active:bg-emerald-600'
    : 'bg-indigo-500 active:bg-indigo-600'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            {expense ? 'Editar' : 'Nueva entrada'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>

        {!expense && (
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${type === 'expense' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              💸 Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              💰 Ingreso
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Importe (€)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0,00"
              min="0"
              step="0.01"
              required
              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-semibold text-gray-800 focus:outline-none focus:ring-2 ${accentClass}`}
            />
          </div>

          {!isIncome && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory?.subcategories?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Subcategoría</label>
                  <select
                    name="subcategoryId"
                    value={form.subcategoryId}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    <option value="">Sin subcategoría</option>
                    {selectedCategory.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {isIncome ? 'Descripción (ej: Sueldo, Alquiler...)' : 'Descripción (opcional)'}
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={isIncome ? 'Ej: Sueldo abril...' : 'Ej: Mercadona, factura mayo...'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            className={`w-full text-white rounded-xl py-4 font-semibold text-lg mt-2 ${btnClass}`}
          >
            {expense ? 'Guardar cambios' : isIncome ? 'Añadir ingreso' : 'Añadir gasto'}
          </button>
        </form>
      </div>
    </div>
  )
}
