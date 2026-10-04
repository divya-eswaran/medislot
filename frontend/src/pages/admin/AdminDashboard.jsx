import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { LayoutDashboard, Users, Stethoscope, Calendar, Bell, BookOpen } from 'lucide-react'
import AdminHome from './AdminHome'
import AdminDoctors from './AdminDoctors'
import AdminPatients from './AdminPatients'
import AdminAppointments from './AdminAppointments'
import AdminSpecializations from './AdminSpecializations'
import NotificationsPage from '../shared/NotificationsPage'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
  { path: '/admin/patients', label: 'Manage Patients', icon: Users },
  { path: '/admin/appointments', label: 'All Appointments', icon: Calendar },
  { path: '/admin/specializations', label: 'Specializations', icon: BookOpen },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="ADMIN">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="specializations" element={<AdminSpecializations />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
