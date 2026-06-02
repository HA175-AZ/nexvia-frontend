import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Header({ title }) {
    const { user } = useAuth()
    const [notifCount, setNotifCount] = useState(0)

    useEffect(() => {
        api.get('/notifications/unread-count')
            .then(res => setNotifCount(res.data.data?.count || 0))
            .catch(() => { })
    }, [])

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '1px solid #eee'
        }}>
            <h1 className="page-title">{title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {notifCount > 0 && (
                    <div style={{
                        background: '#C62828',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                    }}>
                        🔔 {notifCount} notification{notifCount > 1 ? 's' : ''}
                    </div>
                )}
                <div style={{ fontSize: '14px', color: '#555' }}>
                    👤 <strong>{user?.first_name} {user?.last_name}</strong>
                </div>
            </div>
        </div>
    )
}