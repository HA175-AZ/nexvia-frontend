import StatusBadge from './StatusBadge'

export default function LeaveTable({ requests, onCancel }) {
    if (!requests || requests.length === 0) {
        return (
            <div className="empty-state">
                <p>Aucune demande trouvée</p>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date début</th>
                        <th>Date fin</th>
                        <th>Nb jours</th>
                        <th>Statut</th>
                        <th>Commentaire</th>
                        {onCancel && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id}>
                            <td>
                                <span style={{
                                    background: req.color + '20',
                                    color: req.color,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                }}>
                                    {req.leave_type_name}
                                </span>
                            </td>
                            <td>{new Date(req.start_date).toLocaleDateString('fr-FR')}</td>
                            <td>{new Date(req.end_date).toLocaleDateString('fr-FR')}</td>
                            <td>{req.nb_days} j</td>
                            <td><StatusBadge status={req.status} /></td>
                            <td style={{ fontSize: '13px', color: '#C62828' }}>
                                {req.manager_comment || '-'}
                            </td>
                            {onCancel && (
                                <td>
                                    {req.status === 'pending' && (
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '5px 10px', fontSize: '12px' }}
                                            onClick={() => onCancel(req.id)}
                                        >
                                            Annuler
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}