import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import api from '../api/axios'

export default function History() {
  const [requests, setRequests] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leave-requests')
      .then(res => {
        setRequests(res.data.data || [])
        setFiltered(res.data.data || [])
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  const handleFilter = (status) => {
    setActiveFilter(status)
    if (status === 'all') {
      setFiltered(requests)
    } else {
      setFiltered(requests.filter(r => r.status === status))
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette demande ?')) return
    try {
      await api.delete(`/leave-requests/${id}`)
      toast.success('Demande annulée')
      const updated = requests.map(r =>
        r.id === id ? { ...r, status: 'cancelled' } : r
      )
      setRequests(updated)
      setFiltered(updated.filter(r =>
        activeFilter === 'all' ? true : r.status === activeFilter
      ))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur annulation')
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">

        <div className="page-header">
          <h1 className="page-title">📋 Historique de mes demandes</h1>
        </div>

        {/* Filtres */}
        <div className="filters">
          {[
            { key: 'all',       label: 'Toutes' },
            { key: 'pending',   label: '⏳ En attente' },
            { key: 'approved',  label: '✅ Approuvées' },
            { key: 'rejected',  label: '❌ Refusées' },
            { key: 'cancelled', label: '🚫 Annulées' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date demande</th>
                  <th>Type</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Nb jours</th>
                  <th>Statut</th>
                  <th>Commentaire</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.id}>
                    <td>{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
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
                    <td>
                      {req.status === 'pending' && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleCancel(req.id)}
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}