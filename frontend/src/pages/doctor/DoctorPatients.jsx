import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { Users, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    doctorAPI.getAppointments()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Deduplicate patients
  const patients = Object.values(
    appointments.reduce((acc, apt) => {
      if (apt.patientId && !acc[apt.patientId]) {
        acc[apt.patientId] = {
          id: apt.patientId,
          name: apt.patientName,
          visits: 0,
          lastVisit: null,
        }
      }
      if (apt.patientId) {
        acc[apt.patientId].visits += 1
        const d = apt.appointmentDate ? new Date(apt.appointmentDate) : null
        if (d && (!acc[apt.patientId].lastVisit || d > new Date(acc[apt.patientId].lastVisit))) {
          acc[apt.patientId].lastVisit = apt.appointmentDate
        }
      }
      return acc
    }, {})
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Patients</h2>
        <p className="text-slate-500 text-sm mt-1">{patients.length} unique patients seen</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : patients.length === 0 ? (
        <Card><EmptyState icon={Users} title="No patients yet" description="Your patients will appear here after appointments." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(p => (
            <Card key={p.id} className="p-5 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.visits} visit{p.visits !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {p.lastVisit && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} />
                  Last visit: {format(new Date(p.lastVisit), 'MMM dd, yyyy')}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
