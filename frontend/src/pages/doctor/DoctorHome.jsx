import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Card, Badge, Spinner } from '../../components/ui'
import { Calendar, Clock, CheckCircle, Users, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'

export default function DoctorHome() {
  const { user } = useAuth()
  const [today, setToday] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      doctorAPI.getTodayAppointments(),
      doctorAPI.getAppointments(),
    ]).then(([todayRes, allRes]) => {
      setToday(todayRes.data.data || [])
      setAll(allRes.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = {
    todayTotal: today.length,
    todayCompleted: today.filter(a => a.status === 'COMPLETED').length,
    todayPending: today.filter(a => ['CONFIRMED', 'PENDING'].includes(a.status)).length,
    totalPatients: new Set(all.map(a => a.patientId)).size,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <Stethoscope size={180} className="absolute -right-5 -top-5" />
        </div>
        <p className="text-teal-100 text-sm mb-1">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </p>
        <h2 className="text-3xl font-bold mb-2">Dr. {user?.name} 👨‍⚕️</h2>
        <p className="text-teal-100 text-sm">
          You have <strong>{stats.todayPending}</strong> upcoming appointment{stats.todayPending !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={stats.todayTotal} icon={Calendar} color="teal" />
        <StatCard label="Completed Today" value={stats.todayCompleted} icon={CheckCircle} color="green" />
        <StatCard label="Pending Today" value={stats.todayPending} icon={Clock} color="orange" />
        <StatCard label="Total Patients" value={stats.totalPatients} icon={Users} color="purple" />
      </div>

      {/* Today's queue */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-5">Today's Queue</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : today.length === 0 ? (
          <div className="text-center py-10">
            <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...today].sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0)).map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                {/* Token badge */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 font-bold
                  ${apt.status === 'COMPLETED' ? 'bg-green-500' : apt.status === 'CANCELLED' ? 'bg-red-400' : 'bg-teal-600'}`}>
                  <span className="text-[9px] opacity-80">Token</span>
                  <span>#{apt.tokenNumber}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                  {apt.patientName?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{apt.patientName}</p>
                  <p className="text-xs text-slate-500">{apt.startTime} – {apt.endTime} · {apt.reason || 'General consultation'}</p>
                </div>
                <Badge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
