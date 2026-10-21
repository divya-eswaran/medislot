import React, { useEffect, useState } from 'react'
import { patientAPI } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { Pill, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { formatDoctorName } from '../../utils/formatters'

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    patientAPI.getPrescriptions()
      .then(r => setPrescriptions(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Prescriptions</h2>
        <p className="text-slate-500 text-sm mt-1">All prescriptions from your consultations</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : prescriptions.length === 0 ? (
        <Card><EmptyState icon={Pill} title="No prescriptions yet" description="Prescriptions will appear here after your consultations." /></Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-800">{formatDoctorName(p.doctorName)}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {p.prescribedDate ? format(new Date(p.prescribedDate), 'MMMM dd, yyyy') : '—'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
              </div>

              {p.diagnosis && (
                <div className="bg-slate-50 rounded-xl px-4 py-2 mb-4">
                  <p className="text-xs text-slate-500 mb-0.5">Diagnosis</p>
                  <p className="text-sm font-medium text-slate-800">{p.diagnosis}</p>
                </div>
              )}

              {p.items?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Medications</p>
                  <div className="space-y-2">
                    {p.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Pill size={14} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-800">{item.medicineName}</p>
                          <p className="text-xs text-slate-500">{item.dosage} · {item.frequency} · {item.duration}</p>
                        </div>
                        {item.instructions && (
                          <p className="text-xs text-slate-400 text-right max-w-24">{item.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.notes && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-0.5">Doctor's Notes</p>
                  <p className="text-sm text-slate-700">{p.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
