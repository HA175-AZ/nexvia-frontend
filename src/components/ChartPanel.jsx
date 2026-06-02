export default function ChartPanel({ title, subtitle, children, action }) {
  return (
    <section className="chart-panel">
      <div className="chart-panel-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="chart-panel-body">
        {children}
      </div>
    </section>
  )
}