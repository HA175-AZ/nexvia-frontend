import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function NewRequest() {
  const [form, setForm] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [leaveTypes, setLeaveTypes] = useState([])
  const [nbDays, setNbDays] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/leave-types')
      .then(res => setLeaveTypes(res.data.data || []))
      .catch(() => toast.error('Erreur chargement types'))
  }, [])

  useEffect(() => {
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date)
      const end = new Date(form.end_date)
      if (end >= start) {
        let days = 0
        let current = new Date(start)
        while (current <= end) {
          const day = current.getDay()
          if (day !== 0 && day !== 6) days++
          current.setDate(current.getDate() + 1)
        }
        setNbDays(days)
      } else {
        setNbDays(0)
      }
    }
  }, [form.start_date, form.end_date])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (form.end_date < form.start_date) {
      toast.error('La date de fin doit être après la date de début')
      return
    }

    if (nbDays === 0) {
      toast.error('La période sélectionnée ne contient aucun jour ouvré')
      return
    }

    setLoading(true)
    try {
      await api.post('/leave-requests', form)
      toast.success('Demande envoyée avec succès !')
      navigate('/historique')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">

        <div className="page-header">
          <h1 className="page-title">➕ Nouvelle demande de congé</h1>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Type d'absence *</label>
              <select
                name="leave_type_id"
                value={form.leave_type_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner un type --</option>
                {leaveTypes.map(lt => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Date de début *</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date de fin *</label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  min={form.start_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Nombre de jours calculé automatiquement */}
            {nbDays > 0 && (
              <div style={{
                background: '#E3F2FD',
                border: '1px solid #1A56A0',
                borderRadius: '6px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#1A56A0',
                fontWeight: 'bold'
              }}>
                📅 Nombre de jours ouvrés : {nbDays} jour{nbDays > 1 ? 's' : ''}
              </div>
            )}

            <div className="form-group">
              <label>Motif (optionnel)</label>
              <textarea
                name="reason"
                placeholder="Précisez le motif de votre demande..."
                value={form.reason}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Envoi...' : '📤 Envoyer la demande'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Annuler
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}