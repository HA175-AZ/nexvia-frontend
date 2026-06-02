export default function StatCard({ title, value, subtitle, color }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: color || '#1A56A0' }}>
        {value}
      </div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
    </div>
  )
}