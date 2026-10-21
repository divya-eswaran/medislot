import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { patientAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Badge, Card, Spinner } from '../../components/ui'
import { Calendar, Clock, CheckCircle, XCircle, Plus, ChevronRight, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { formatDoctorName, getDoctorInitial } from '../../utils/formatters'

export default function PatientHome() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    patientAPI.getAppointments()
      .then(res => setAppointments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['CONFIRMED', 'PENDING'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => ['CANCELLED', 'REJECTED'].includes(a.status)).length,
  }

  const recent = [...appointments].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)).slice(0, 5)

  const getHour = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <Stethoscope size={200} className="absolute -right-10 -top-10 rotate-12" />
        </div>
        <p className="text-blue-100 text-sm mb-1">{getHour()},</p>
        <h2 className="text-3xl font-bold mb-3">{user?.name} 👋</h2>
        <p className="text-blue-100 text-sm mb-5">Stay on top of your health journey.</p>
        <Link to="/patient/book"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm">
          <Plus size={16} /> Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={stats.total} icon={Calendar} color="blue" />
        <StatCard label="Upcoming" value={stats.upcoming} icon={Clock} color="orange" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} color="rose" />
      </div>

      {/* Recent appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
          <Link to="/patient/appointments" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No appointments yet</p>
            <Link to="/patient/book" className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm hover:underline">
              <Plus size={14} /> Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                  {getDoctorInitial(apt.doctorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{formatDoctorName(apt.doctorName)}</p>
                  <p className="text-xs text-slate-500">{apt.specialization || apt.doctorSpecialization}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">
                    {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd') : '—'}
                  </p>
                  <p className="text-xs text-slate-500">{apt.startTime}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge status={apt.status} />
                </div>
                {apt.tokenNumber && (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    #{apt.tokenNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
