import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { LayoutDashboard, Calendar, FileText, Pill, Bell, User } from 'lucide-react'
import PatientHome from './PatientHome'
import BookAppointment from './BookAppointment'
import PatientAppointments from './PatientAppointments'
import PatientPrescriptions from './PatientPrescriptions'
import PatientMedicalRecords from './PatientMedicalRecords'
import PatientProfile from './PatientProfile'
import NotificationsPage from '../shared/NotificationsPage'

const navItems = [
  { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patient/book', label: 'Book Appointment', icon: Calendar },
  { path: '/patient/appointments', label: 'My Appointments', icon: FileText },
  { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
  { path: '/patient/records', label: 'Medical Records', icon: FileText },
  { path: '/patient/notifications', label: 'Notifications', icon: Bell },
  { path: '/patient/profile', label: 'My Profile', icon: User },
]

export default function PatientDashboard() {
  return (
    <DashboardLayout navItems={navItems} role="PATIENT">
      <Routes>
        <Route index element={<PatientHome />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="records" element={<PatientMedicalRecords />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </DashboardLayout>
  )
}
