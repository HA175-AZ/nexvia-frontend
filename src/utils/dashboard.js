const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvees',
  rejected: 'Refusees',
  cancelled: 'Annulees',
}

const STATUS_COLORS = {
  pending: '#F59E0B',
  approved: '#16A34A',
  rejected: '#DC2626',
  cancelled: '#64748B',
}

const DEFAULT_CHART_COLORS = ['#1A56A0', '#2E75B6', '#60A5FA', '#93C5FD', '#F59E0B', '#10B981', '#EF4444']

function isUsableColor(value) {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

function assignDistinctColors(series) {
  const usedColors = new Set()

  return series.map((item, index) => {
    const requestedColor = isUsableColor(item.color) ? item.color.trim() : null
    const fallbackColor = DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
    const color = requestedColor && !usedColors.has(requestedColor)
      ? requestedColor
      : fallbackColor

    usedColors.add(color)
    return { ...item, color }
  })
}

function normalizeNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export function buildMonthlySeries(items, dateField, valueField = 'count') {
  const monthlyValues = Array.from({ length: 12 }, (_, monthIndex) => ({
    month: MONTH_LABELS[monthIndex],
    [valueField]: 0,
  }))

  items.forEach((item) => {
    const rawDate = item?.[dateField]
    if (!rawDate) return

    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) return

    const monthIndex = date.getMonth()
    monthlyValues[monthIndex][valueField] += normalizeNumber(item.nb_days ?? item[valueField] ?? 1)
  })

  return monthlyValues
}

export function buildMonthlySeriesFromApi(items, valueField = 'days') {
  const monthlyValues = Array.from({ length: 12 }, (_, monthIndex) => ({
    month: MONTH_LABELS[monthIndex],
    [valueField]: 0,
  }))

  items.forEach((item) => {
    const monthIndex = normalizeNumber(item.month) - 1
    if (monthIndex < 0 || monthIndex > 11) return
    monthlyValues[monthIndex][valueField] = normalizeNumber(item.total_days)
  })

  return monthlyValues
}

export function buildStatusSeries(items) {
  const counts = items.reduce((accumulator, item) => {
    const status = item.status || 'pending'
    accumulator[status] = (accumulator[status] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(counts).map(([status, value]) => ({
    name: STATUS_LABELS[status] || status,
    value,
    color: STATUS_COLORS[status] || DEFAULT_CHART_COLORS[0],
  }))
}

export function buildTypeSeries(items) {
  const counts = items.reduce((accumulator, item) => {
    const typeName = item.leave_type_name || item.name || 'Autre'
    const current = accumulator[typeName] || {
      name: typeName,
      value: 0,
      color: item.color || DEFAULT_CHART_COLORS[0],
    }

    current.value += normalizeNumber(item.nb_days ?? item.total_days ?? 1)
    accumulator[typeName] = current
    return accumulator
  }, {})

  return assignDistinctColors(Object.values(counts))
}

export function buildEmployeeSeries(items, limit = 5) {
  const counts = items.reduce((accumulator, item) => {
    const employeeName = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Employe'
    accumulator[employeeName] = (accumulator[employeeName] || 0) + normalizeNumber(item.nb_days ?? item.total_days ?? 1)
    return accumulator
  }, {})

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit)
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? '')
  return `"${stringValue.replace(/"/g, '""')}"`
}

export function downloadCsv(filename, rows) {
  if (!rows.length) return false

  const content = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(';'))
    .join('\n')

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}

export const chartPalette = DEFAULT_CHART_COLORS