import { Fragment, useState, useEffect } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ChartPanel from '../components/ChartPanel'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import api from '../api/axios'
import { buildEmployeeSeries, buildTypeSeries, chartPalette } from '../utils/dashboard'

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rejectId, setRejectId] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = () => {
    api.get('/leave-requests')
      .then(res => setRequests(res.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Valider cette demande ?')) return
    try {
      await api.put(`/leave-requests/${id}/approve`)
      toast.success('Demande approuvée ✅')
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const handleReject = async (id) => {
    if (!comment.trim()) {
      toast.error('Veuillez ajouter un commentaire de refus')
      return
    }
    try {
      await api.put(`/leave-requests/${id}/reject`, { comment })
      toast.success('Demande refusée')
      setRejectId(null)
      setComment('')
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  const requestsByType = buildTypeSeries(requests)
  const requestsByEmployee = buildEmployeeSeries(requests)
  const totalDaysToReview = requests.reduce((sum, request) => sum + Number(request.nb_days || 0), 0)
  const employeesWaiting = new Set(requests.map((request) => request.user_id)).size

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">

        <div className="page-header">
          <h1 className="page-title">✅ Validation des demandes</h1>
          <div style={{
            background: '#FFF3E0',
            color: '#F57C00',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {requests.length} demande{requests.length > 1 ? 's' : ''} en attente
          </div>
        </div>

        <div className="cards-grid">
          <StatCard
            title="Demandes a traiter"
            value={requests.length}
            subtitle="en attente de validation"
            color="#F57C00"
          />
          <StatCard
            title="Jours a arbitrer"
            value={totalDaysToReview}
            subtitle="volume cumule"
            color="#1A56A0"
          />
          <StatCard
            title="Employes concernes"
            value={employeesWaiting}
            subtitle="collaborateurs distincts"
            color="#2E7D32"
          />
        </div>

        <div className="charts-grid">
          <ChartPanel
            title="Demandes par type"
            subtitle="Volume des absences a valider"
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={requestsByType}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {requestsByType.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color || chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {requestsByType.map((entry, index) => (
                <div key={entry.name} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: entry.color || chartPalette[index % chartPalette.length] }} />
                  <span>{entry.name}</span>
                  <strong>{entry.value} j</strong>
                </div>
              ))}
            </div>
          </ChartPanel>

          <ChartPanel
            title="Employes les plus exposes"
            subtitle="Jours de conges en attente par collaborateur"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={requestsByEmployee} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" allowDecimals={false} stroke="#64748B" fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#2E75B6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>🎉 Aucune demande en attente !</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Nb jours</th>
                  <th>Motif</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <Fragment key={req.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>
                          {req.first_name} {req.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#777' }}>
                          {new Date(req.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
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
                      <td><strong>{req.nb_days} j</strong></td>
                      <td style={{ fontSize: '13px', color: '#555' }}>
                        {req.reason || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => handleApprove(req.id)}
                          >
                            ✅ Valider
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => setRejectId(rejectId === req.id ? null : req.id)}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Zone de commentaire pour refus */}
                    {rejectId === req.id && (
                      <tr>
                        <td colSpan="7" style={{ background: '#FFEBEE', padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Motif du refus (obligatoire)"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #C62828',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReject(req.id)}
                            >
                              Confirmer le refus
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => { setRejectId(null); setComment('') }}
                            >
                              Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}