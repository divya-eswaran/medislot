import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RedirectIfLoggedIn } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
          <Route path="/register" element={<RedirectIfLoggedIn><RegisterPage /></RedirectIfLoggedIn>} />

          {/* Patient routes */}
          <Route path="/patient/*" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />

          {/* Doctor routes */}
          <Route path="/doctor/*" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/*" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
