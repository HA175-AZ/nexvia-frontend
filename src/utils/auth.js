export const getToken = () => {
    return localStorage.getItem('token')
}

export const getUser = () => {
    try {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    } catch {
        return null
    }
}

export const isAuthenticated = () => {
    return !!getToken()
}

export const isAdmin = () => {
    const user = getUser()
    return user?.role === 'admin'
}

export const isManager = () => {
    const user = getUser()
    return user?.role === 'manager' || user?.role === 'admin'
}

export const removeAuth = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

