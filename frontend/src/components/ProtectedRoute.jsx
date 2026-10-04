import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading MediSlot...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export const RedirectIfLoggedIn = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    const roleRoutes = {
      ADMIN: '/admin',
      DOCTOR: '/doctor',
      PATIENT: '/patient',
    }
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />
  }
  return children
}
