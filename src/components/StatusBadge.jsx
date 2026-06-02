const labels = {
  pending:   '⏳ En attente',
  approved:  '✅ Approuvé',
  rejected:  '❌ Refusé',
  cancelled: '🚫 Annulé',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {labels[status] || status}
    </span>
  )
}