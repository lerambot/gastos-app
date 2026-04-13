export function exportToCsv(expenses, categories, filename = 'gastos.csv') {
  function getCategoryLabel(exp) {
    if (exp.type === 'income') return 'Ingreso'
    const cat = categories.find(c => c.id === exp.categoryId)
    if (!cat) return 'Desconocida'
    if (exp.subcategoryId) {
      const sub = cat.subcategories?.find(s => s.id === exp.subcategoryId)
      return `${cat.name} › ${sub?.name ?? exp.subcategoryId}`
    }
    return cat.name
  }

  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Importe']
  const rows = expenses.map(exp => [
    exp.date,
    exp.type === 'income' ? 'Ingreso' : 'Gasto',
    getCategoryLabel(exp),
    exp.description ?? '',
    exp.amount.toFixed(2).replace('.', ','),
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
