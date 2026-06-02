import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import History from './pages/History'
import Calendar from './pages/Calendar'
import ManagerDashboard from './pages/ManagerDashboard'
import Admin from './pages/Admin'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/nouvelle-demande" element={
        <PrivateRoute><NewRequest /></PrivateRoute>
      } />
      <Route path="/historique" element={
        <PrivateRoute><History /></PrivateRoute>
      } />
      <Route path="/calendrier" element={
        <PrivateRoute><Calendar /></PrivateRoute>
      } />
      <Route path="/manager" element={
        <PrivateRoute roles={['manager', 'admin']}>
          <ManagerDashboard />
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute roles={['admin']}>
          <Admin />
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}