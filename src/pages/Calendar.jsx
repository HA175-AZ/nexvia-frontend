import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Calendar() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        api.get('/leave-requests/calendar')
            .then(res => setEvents(res.data.data || []))
            .catch(() => toast.error('Erreur chargement calendrier'))
            .finally(() => setLoading(false))
    }, [])

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
        return day === 0 ? 6 : day - 1
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const getEventsForDay = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        return events.filter(event => {
            const start = new Date(event.start_date)
            const end = new Date(event.end_date)
            return date >= start && date <= end
        })
    }

    const monthNames = [
        'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ]

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date()

    return (
        <div className="layout">
            <Navbar />
            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Calendrier de l equipe</h1>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                        { color: '#1A56A0', label: 'Conges payes' },
                        { color: '#2E75B6', label: 'RTT' },
                        { color: '#C62828', label: 'Maladie' },
                        { color: '#757575', label: 'Sans solde' },
                        { color: '#F57C00', label: 'Conge exceptionnel' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color }} />
                            <span style={{ fontSize: '13px', color: '#555' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <button className="btn btn-secondary" onClick={prevMonth}>Precedent</button>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A56A0' }}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button className="btn btn-secondary" onClick={nextMonth}>Suivant</button>
                    </div>

                    {loading ? (
                        <div className="loading">Chargement...</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                                {dayNames.map(day => (
                                    <div key={day} style={{
                                        textAlign: 'center', padding: '8px', fontWeight: 'bold',
                                        fontSize: '13px', color: '#777', background: '#F5F7FA', borderRadius: '4px'
                                    }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} style={{ minHeight: '80px' }} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1
                                    const dayEvents = getEventsForDay(day)
                                    const isToday =
                                        today.getDate() === day &&
                                        today.getMonth() === currentDate.getMonth() &&
                                        today.getFullYear() === currentDate.getFullYear()
                                    const isWeekend = ((firstDay + i) % 7) >= 5

                                    return (
                                        <div key={day} style={{
                                            minHeight: '80px',
                                            background: isWeekend ? '#F9F9F9' : 'white',
                                            border: isToday ? '2px solid #1A56A0' : '1px solid #eee',
                                            borderRadius: '6px', padding: '6px',
                                        }}>
                                            <div style={{
                                                fontWeight: isToday ? 'bold' : 'normal',
                                                color: isToday ? '#1A56A0' : isWeekend ? '#bbb' : '#333',
                                                fontSize: '13px', marginBottom: '4px'
                                            }}>
                                                {day}
                                            </div>
                                            {dayEvents.map((event, idx) => (
                                                <div key={idx} style={{
                                                    background: event.color, color: 'white', fontSize: '11px',
                                                    padding: '2px 5px', borderRadius: '3px', marginBottom: '2px',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {event.employee_name}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}