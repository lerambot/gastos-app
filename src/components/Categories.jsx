import { useState } from 'react'

const ICONS = ['🛒','💡','🚗','🏥','⚽','👕','🎬','🏪','📦','🎒','🍽️','✈️','🏠','🐾','💄','📚','🎮','💊','🛠️','🎁']

export default function Categories({ categories, onChange }) {
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📦')
  const [expandedId, setExpandedId] = useState(null)
  const [addingSubFor, setAddingSubFor] = useState(null)
  const [newSubName, setNewSubName] = useState('')

  function addCategory() {
    if (!newCatName.trim()) return
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    onChange([...categories, { id, name: newCatName.trim(), icon: newCatIcon, subcategories: [] }])
    setNewCatName('')
    setNewCatIcon('📦')
    setAddingCat(false)
  }

  function deleteCategory(id) {
    onChange(categories.filter(c => c.id !== id))
  }

  function addSubcategory(catId) {
    if (!newSubName.trim()) return
    const subId = newSubName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    onChange(categories.map(c =>
      c.id === catId
        ? { ...c, subcategories: [...(c.subcategories ?? []), { id: subId, name: newSubName.trim() }] }
        : c
    ))
    setNewSubName('')
    setAddingSubFor(null)
  }

  function deleteSubcategory(catId, subId) {
    onChange(categories.map(c =>
      c.id === catId
        ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) }
        : c
    ))
  }

  return (
    <div className="flex flex-col gap-3 pb-32">
      {categories.map(cat => (
        <div key={cat.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer"
            onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat.icon}</span>
              <span className="font-medium text-gray-800">{cat.name}</span>
              {cat.subcategories?.length > 0 && (
                <span className="text-xs text-gray-400">({cat.subcategories.length})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }}
                className="text-red-400 px-2 py-1 rounded-lg active:bg-red-50 text-sm"
              >
                🗑️
              </button>
              <span className="text-gray-300">{expandedId === cat.id ? '▲' : '▼'}</span>
            </div>
          </div>

          {expandedId === cat.id && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
              {cat.subcategories?.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">› {sub.name}</span>
                  <button
                    onClick={() => deleteSubcategory(cat.id, sub.id)}
                    className="text-red-400 text-xs px-2 py-1 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {addingSubFor === cat.id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    autoFocus
                    value={newSubName}
                    onChange={e => setNewSubName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubcategory(cat.id)}
                    placeholder="Nombre subcategoría"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => addSubcategory(cat.id)}
                    className="bg-indigo-500 text-white rounded-xl px-3 py-2 text-sm"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => { setAddingSubFor(null); setNewSubName('') }}
                    className="text-gray-400 px-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubFor(cat.id)}
                  className="mt-2 text-indigo-500 text-sm font-medium"
                >
                  + Añadir subcategoría
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {addingCat ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-medium text-gray-700">Nueva categoría</p>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setNewCatIcon(icon)}
                className={`text-2xl p-1 rounded-xl ${newCatIcon === icon ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="Nombre categoría"
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setAddingCat(false); setNewCatName('') }}
              className="flex-1 border border-gray-200 rounded-xl py-3 text-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={addCategory}
              className="flex-1 bg-indigo-500 text-white rounded-xl py-3 font-medium"
            >
              Añadir
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCat(true)}
          className="flex items-center justify-center gap-2 bg-white rounded-2xl py-4 text-indigo-500 font-medium shadow-sm active:bg-indigo-50"
        >
          <span className="text-xl">+</span> Nueva categoría
        </button>
      )}
    </div>
  )
}
