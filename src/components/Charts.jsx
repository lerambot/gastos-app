const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
]

function fmt(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €'
}

function DonutChart({ byCat }) {
  const items = Object.values(byCat)
  const total = items.reduce((s, item) => s + item.total, 0)

  if (total === 0 || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">
        Sin datos para mostrar
      </div>
    )
  }

  const cx = 100
  const cy = 100
  const outerR = 80
  const innerR = 50

  let currentAngle = -Math.PI / 2
  const slices = items.map((item, i) => {
    const pct = item.total / total
    const angle = pct * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const x1 = cx + outerR * Math.cos(startAngle)
    const y1 = cy + outerR * Math.sin(startAngle)
    const x2 = cx + outerR * Math.cos(endAngle)
    const y2 = cy + outerR * Math.sin(endAngle)
    const ix1 = cx + innerR * Math.cos(endAngle)
    const iy1 = cy + innerR * Math.sin(endAngle)
    const ix2 = cx + innerR * Math.cos(startAngle)
    const iy2 = cy + innerR * Math.sin(startAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return { d, color: COLORS[i % COLORS.length], item, pct }
  })

  return (
    <div>
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} />
        ))}
        <text x="100" y="96" textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="500">Total</text>
        <text x="100" y="112" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="700">
          {fmt(total)}
        </text>
      </svg>
      <div className="mt-3 flex flex-col gap-1.5 px-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                {slice.item.cat.icon} {slice.item.cat.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {(slice.pct * 100).toFixed(0)}%
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 shrink-0">
              {fmt(slice.item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ expenses, categories }) {
  const today = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('es-ES', { month: 'short' })
    months.push({ key, label })
  }

  const totals = months.map(m => {
    const sum = expenses
      .filter(e => e.type !== 'income' && e.date.startsWith(m.key))
      .reduce((s, e) => s + e.amount, 0)
    return { ...m, sum }
  })

  const maxVal = Math.max(...totals.map(m => m.sum), 1)

  const svgWidth = 320
  const svgHeight = 180
  const paddingTop = 30
  const paddingBottom = 35
  const paddingLeft = 10
  const paddingRight = 10
  const chartH = svgHeight - paddingTop - paddingBottom
  const chartW = svgWidth - paddingLeft - paddingRight
  const barW = (chartW / months.length) * 0.6
  const gap = chartW / months.length

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full"
      style={{ height: svgHeight }}
    >
      {totals.map((m, i) => {
        const barH = maxVal > 0 ? (m.sum / maxVal) * chartH : 0
        const x = paddingLeft + i * gap + gap / 2 - barW / 2
        const y = paddingTop + chartH - barH
        return (
          <g key={m.key}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="4"
              fill="#6366f1"
            />
            {m.sum > 0 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="8"
                fill="#6366f1"
                fontWeight="600"
              >
                {m.sum >= 1000
                  ? (m.sum / 1000).toFixed(1) + 'k'
                  : m.sum.toFixed(0)}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={svgHeight - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
              fontWeight="500"
              className="capitalize"
            >
              {m.label}
            </text>
          </g>
        )
      })}
      <line
        x1={paddingLeft}
        y1={paddingTop + chartH}
        x2={svgWidth - paddingRight}
        y2={paddingTop + chartH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function Charts({ byCat, expenses, categories }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
          Distribución por categoría
        </h3>
        <DonutChart byCat={byCat} />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
          Gastos últimos 6 meses
        </h3>
        <BarChart expenses={expenses} categories={categories} />
      </div>
    </div>
  )
}
