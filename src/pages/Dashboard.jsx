import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ChartPanel from '../components/ChartPanel'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import api from '../api/axios'
import { buildMonthlySeries, buildStatusSeries } from '../utils/dashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leave-requests')
      .then(res => setRequests(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const pending = requests.filter(r => r.status === 'pending').length
  const approved = requests.filter(r => r.status === 'approved').length
  const monthlyRequests = buildMonthlySeries(requests, 'created_at')
  const requestStatusData = buildStatusSeries(requests)

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">

        <div className="page-header">
          <h1 className="page-title">
            👋 Bonjour, {user?.first_name} !
          </h1>
          <Link to="/nouvelle-demande" className="btn btn-primary">
            ➕ Nouvelle demande
          </Link>
        </div>

        {/* Cartes statistiques */}
        <div className="cards-grid">
          <StatCard
            title="Congés payés restants"
            value={user?.leave_balance_cp || 25}
            subtitle="jours disponibles"
            color="#1A56A0"
          />
          <StatCard
            title="RTT restants"
            value={user?.leave_balance_rtt || 10}
            subtitle="jours disponibles"
            color="#2E75B6"
          />
          <StatCard
            title="Demandes en attente"
            value={pending}
            subtitle="en cours de validation"
            color="#F57C00"
          />
          <StatCard
            title="Demandes approuvées"
            value={approved}
            subtitle="cette année"
            color="#2E7D32"
          />
        </div>

        <div className="charts-grid">
          <ChartPanel
            title="Evolution des demandes"
            subtitle="Nombre de demandes creees par mois"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRequests}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748B" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#1A56A0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="Repartition des statuts"
            subtitle="Toutes mes demandes confondues"
          >
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={requestStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {requestStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {requestStatusData.map((entry) => (
                <div key={entry.name} className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: entry.color }} />
                  <span>{entry.name}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </ChartPanel>
        </div>

        {/* Dernières demandes */}
        <div className="page-header">
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Mes dernières demandes
          </h2>
          <Link to="/historique" style={{ color: '#1A56A0', fontSize: '14px' }}>
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>Aucune demande pour le moment</p>
            <Link to="/nouvelle-demande" className="btn btn-primary" style={{ marginTop: '15px', display: 'inline-block' }}>
              Créer ma première demande
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Nb jours</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map(req => (
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