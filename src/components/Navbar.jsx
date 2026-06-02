import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import nexviaLogo from '../assets/nexvia-logo.svg'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={nexviaLogo} alt="Nexvia Solutions" className="sidebar-logo-image" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/nouvelle-demande">➕ Nouvelle demande</NavLink>
        <NavLink to="/historique">📋 Historique</NavLink>
        <NavLink to="/calendrier">📅 Calendrier</NavLink>

        {/* Menu manager */}
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <NavLink to="/manager">✅ Validation équipe</NavLink>
        )}

        {/* Menu admin */}
        {user?.role === 'admin' && (
          <NavLink to="/admin">⚙️ Administration</NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div>👤 {user?.first_name} {user?.last_name}</div>
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
          {user?.role}
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  )
}