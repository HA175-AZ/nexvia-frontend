import { useState, useEffect } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ChartPanel from '../components/ChartPanel'
import StatCard from '../components/StatCard'
import api from '../api/axios'
import { buildMonthlySeriesFromApi, buildTypeSeries, chartPalette, downloadCsv } from '../utils/dashboard'

export default function Admin() {
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editUser, setEditUser] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = () => {
        Promise.all([api.get('/users'), api.get('/stats')])
            .then(([usersRes, statsRes]) => {
                setUsers(usersRes.data.data || [])
                setStats(statsRes.data.data || null)
            })
            .catch(() => toast.error('Erreur chargement utilisateurs'))
            .finally(() => setLoading(false))
    }

    const handleDeactivate = async (id) => {
        if (!window.confirm('Désactiver cet utilisateur ?')) return
        try {
            await api.delete(`/users/${id}`)
            toast.success('Utilisateur désactivé')
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur')
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            await api.put(`/users/${editUser.id}`, editUser)
            toast.success('Utilisateur mis à jour ✅')
            setEditUser(null)
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur')
        }
    }

    const filtered = users.filter(u =>
        `${u.first_name} ${u.last_name} ${u.email}`
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    const absencesByMonth = buildMonthlySeriesFromApi(stats?.abs_by_month || [])
    const daysByType = buildTypeSeries(stats?.days_by_type || [])
    const topAbsences = (stats?.top_absences || []).map((item) => ({
        name: item.name,
        value: Number(item.total_days || 0),
    }))

    const exportUsers = () => {
        const exported = downloadCsv('nexvia-utilisateurs.csv', [
            ['Nom', 'Email', 'Departement', 'Role', 'Solde CP', 'Solde RTT', 'Statut'],
            ...filtered.map((user) => [
                `${user.first_name} ${user.last_name}`,
                user.email,
                user.department_name,
                user.role_name,
                user.leave_balance_cp,
                user.leave_balance_rtt,
                user.is_active ? 'Actif' : 'Inactif',
            ]),
        ])

        if (exported) {
            toast.success('Export utilisateurs genere')
        }
    }

    const exportStats = () => {
        if (!stats) {
            toast.error('Statistiques indisponibles')
            return
        }

        const exported = downloadCsv('nexvia-statistiques.csv', [
            ['Indicateur', 'Valeur'],
            ['Employes actifs', stats.total_employees],
            ['Demandes totales', stats.total_requests],
            ['Demandes en attente', stats.pending_requests],
            ['', ''],
            ['Absences par type', 'Jours'],
            ...(stats.days_by_type || []).map((item) => [item.name, item.total_days]),
            ['', ''],
            ['Top absences', 'Jours'],
            ...(stats.top_absences || []).map((item) => [item.name, item.total_days]),
        ])

        if (exported) {
            toast.success('Export statistiques genere')
        }
    }

    return (
        <div className="layout">
            <Navbar />
            <div className="main-content">

                <div className="page-header">
                    <h1 className="page-title">⚙️ Administration</h1>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={exportStats}>
                            📈 Exporter les stats
                        </button>
                        <button className="btn btn-primary" onClick={exportUsers}>
                            ⬇️ Exporter les utilisateurs
                        </button>
                    </div>
                </div>

                <div className="cards-grid">
                    <StatCard
                        title="Employes actifs"
                        value={stats?.total_employees || 0}
                        subtitle="base active"
                        color="#1A56A0"
                    />
                    <StatCard
                        title="Demandes cette annee"
                        value={stats?.total_requests || 0}
                        subtitle="toutes soumissions confondues"
                        color="#2E75B6"
                    />
                    <StatCard
                        title="Demandes en attente"
                        value={stats?.pending_requests || 0}
                        subtitle="a traiter par les managers"
                        color="#F57C00"
                    />
                </div>

                <div className="charts-grid admin-charts-grid">
                    <ChartPanel
                        title="Absences par mois"
                        subtitle="Jours valides sur l'annee en cours"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={absencesByMonth}>
                                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                                <YAxis allowDecimals={false} stroke="#64748B" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="days" fill="#1A56A0" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    <ChartPanel
                        title="Repartition par type"
                        subtitle="Jours d'absence approuves"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={daysByType}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >
                                    {daysByType.map((entry, index) => (
                                        <Cell key={entry.name} fill={entry.color || chartPalette[index % chartPalette.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {daysByType.map((entry, index) => (
                                <div key={entry.name} className="chart-legend-item">
                                    <span className="chart-legend-dot" style={{ background: entry.color || chartPalette[index % chartPalette.length] }} />
                                    <span>{entry.name}</span>
                                    <strong>{entry.value} j</strong>
                                </div>
                            ))}
                        </div>
                    </ChartPanel>

                    <ChartPanel
                        title="Top absences"
                        subtitle="Collaborateurs avec le plus de jours approuves"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topAbsences} layout="vertical" margin={{ left: 16 }}>
                                <XAxis type="number" allowDecimals={false} stroke="#64748B" fontSize={12} />
                                <YAxis type="category" dataKey="name" width={120} stroke="#64748B" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#2E75B6" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                {/* Formulaire modification */}
                {editUser && (
                    <div className="form-container" style={{ marginBottom: '30px' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>
                            ✏️ Modifier : {editUser.first_name} {editUser.last_name}
                        </h2>
                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Prénom</label>
                                    <input
                                        type="text"
                                        value={editUser.first_name}
                                        onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nom</label>
                                    <input
                                        type="text"
                                        value={editUser.last_name}
                                        onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Rôle</label>
                                    <select
                                        value={editUser.role_id}
                                        onChange={(e) => setEditUser({ ...editUser, role_id: e.target.value })}
                                    >
                                        <option value="1">Employé</option>
                                        <option value="2">Manager</option>
                                        <option value="3">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Département</label>
                                    <select
                                        value={editUser.department_id}
                                        onChange={(e) => setEditUser({ ...editUser, department_id: e.target.value })}
                                    >
                                        <option value="1">Développement</option>
                                        <option value="2">Infrastructure</option>
                                        <option value="3">Commercial</option>
                                        <option value="4">RH / Administration</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Solde Congés Payés (jours)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={editUser.leave_balance_cp}
                                        onChange={(e) => setEditUser({ ...editUser, leave_balance_cp: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Solde RTT (jours)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={editUser.leave_balance_rtt}
                                        onChange={(e) => setEditUser({ ...editUser, leave_balance_rtt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">
                                    💾 Enregistrer
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditUser(null)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Barre de recherche */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher un employé..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '300px'
                        }}
                    />
                </div>

                {/* Tableau utilisateurs */}
                {loading ? (
                    <div className="loading">Chargement...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Département</th>
                                    <th>Rôle</th>
                                    <th>Solde CP</th>
                                    <th>Solde RTT</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <strong>{user.first_name} {user.last_name}</strong>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#555' }}>{user.email}</td>
                                        <td style={{ fontSize: '13px' }}>{user.department_name}</td>
                                        <td>
                                            <span style={{
                                                background: user.role_name === 'admin' ? '#1A56A020' :
                                                    user.role_name === 'manager' ? '#2E7D3220' : '#F5F5F5',
                                                color: user.role_name === 'admin' ? '#1A56A0' :
                                                    user.role_name === 'manager' ? '#2E7D32' : '#555',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {user.role_name}
                                            </span>
                                        </td>
                                        <td>{user.leave_balance_cp} j</td>
                                        <td>{user.leave_balance_rtt} j</td>
                                        <td>
                                            <span style={{
                                                background: user.is_active ? '#E8F5E9' : '#FFEBEE',
                                                color: user.is_active ? '#2E7D32' : '#C62828',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {user.is_active ? '✅ Actif' : '❌ Inactif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                    onClick={() => setEditUser(user)}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                {user.is_active === 1 && (
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                                        onClick={() => handleDeactivate(user.id)}
                                                    >
                                                        🚫 Désactiver
                                                    </button>
                                                )}
                                            </div>
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