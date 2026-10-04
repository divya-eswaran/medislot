import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { LayoutDashboard, Calendar, Users, ClipboardList, Clock, Bell, User, Settings } from 'lucide-react'
import DoctorHome from './DoctorHome'
import DoctorAppointments from './DoctorAppointments'
import DoctorSchedule from './DoctorSchedule'
import DoctorPatients from './DoctorPatients'
import DoctorProfile from './DoctorProfile'
import NotificationsPage from '../shared/NotificationsPage'

const navItems = [
  { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
  { path: '/doctor/patients', label: 'My Patients', icon: Users },
  { path: '/doctor/schedule', label: 'My Schedule', icon: Clock },
  { path: '/doctor/notifications', label: 'Notifications', icon: Bell },
  { path: '/doctor/profile', label: 'Profile', icon: User },
]

export default function DoctorDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="DOCTOR">
      <Routes>
        <Route index element={<DoctorHome />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
