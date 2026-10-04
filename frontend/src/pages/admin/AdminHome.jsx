import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import { StatCard, Card, Spinner } from '../../components/ui'
import { Users, Stethoscope, Calendar, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#14b8a6', '#a855f7', '#f59e0b', '#ef4444']

export default function AdminHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-14"><Spinner /></div>

  const appointmentData = stats?.appointmentsByStatus
    ? Object.entries(stats.appointmentsByStatus).map(([name, value]) => ({ name, value }))
    : []

  const specialData = stats?.appointmentsBySpecialization
    ? Object.entries(stats.appointmentsBySpecialization).slice(0, 6).map(([name, value]) => ({ name: name.slice(0, 10), value }))
    : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Activity size={160} />
        </div>
        <h2 className="text-3xl font-bold mb-1">Admin Overview</h2>
        <p className="text-purple-100 text-sm">MediSlot Platform Analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Doctors" value={stats?.totalDoctors ?? '—'} icon={Stethoscope} color="teal" />
        <StatCard label="Total Patients" value={stats?.totalPatients ?? '—'} icon={Users} color="blue" />
        <StatCard label="Total Appointments" value={stats?.totalAppointments ?? '—'} icon={Calendar} color="purple" />
        <StatCard label="Completed" value={stats?.completedAppointments ?? '—'} icon={CheckCircle} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointments by status */}
        {appointmentData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Appointments by Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={appointmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {appointmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* By specialization */}
        {specialData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">Appointments by Specialization</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={specialData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Quick summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Doctors', value: stats?.activeDoctors ?? '—', color: 'bg-teal-50 text-teal-700' },
          { label: 'Active Patients', value: stats?.activePatients ?? '—', color: 'bg-blue-50 text-blue-700' },
          { label: "Today's Appointments", value: stats?.todayAppointments ?? '—', color: 'bg-purple-50 text-purple-700' },
          { label: 'Pending Doctor Approvals', value: stats?.pendingDoctors ?? '—', color: 'bg-amber-50 text-amber-700' },
        ].map(s => (
          <Card key={s.label} className={`p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm mt-1 opacity-80">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
