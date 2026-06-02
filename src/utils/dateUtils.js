// Calculer les jours ouvrés entre deux dates
export const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let days = 0

    const current = new Date(start)
    while (current <= end) {
        const day = current.getDay()
        if (day !== 0 && day !== 6) days++ // Exclure samedi et dimanche
        current.setDate(current.getDate() + 1)
    }
    return days
}

// Formater une date en français
export const formatDateFR = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Formater une date avec le jour
export const formatDateLong = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

// Vérifier si une date est dans le passé
export const isPast = (dateString) => {
    return new Date(dateString) < new Date()
}

// Vérifier si une date est aujourd'hui
export const isToday = (dateString) => {
    const today = new Date()
    const date = new Date(dateString)
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

// Obtenir le nom du mois en français
export const getMonthName = (monthIndex) => {
    const months = [
        'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
    ]
    return months[monthIndex]
}

// Obtenir la date du jour au format YYYY-MM-DD
export const getTodayString = () => {
    return new Date().toISOString().split('T')[0]
}