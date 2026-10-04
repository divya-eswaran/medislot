import React, { useEffect, useState } from 'react'
import { patientAPI } from '../../api/services'
import { Card, Spinner, EmptyState } from '../../components/ui'
import { FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    patientAPI.getMedicalRecords()
      .then(r => setRecords(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Medical Records</h2>
        <p className="text-slate-500 text-sm mt-1">Your complete health history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : records.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No records yet" description="Medical records appear after completed consultations." /></Card>
      ) : (
        <div className="space-y-4">
          {records.map(r => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-800">Visit — Dr. {r.doctorName}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {r.visitDate ? format(new Date(r.visitDate), 'MMMM dd, yyyy') : '—'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{r.recordType || 'Consultation'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {r.chiefComplaint && (
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-0.5">Chief Complaint</p>
                    <p className="text-sm text-slate-800">{r.chiefComplaint}</p>
                  </div>
                )}
                {r.diagnosis && (
                  <div className="bg-orange-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-0.5">Diagnosis</p>
                    <p className="text-sm text-slate-800">{r.diagnosis}</p>
                  </div>
                )}
                {r.vitalSigns && (
                  <div className="bg-green-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-0.5">Vital Signs</p>
                    <p className="text-sm text-slate-800">{r.vitalSigns}</p>
                  </div>
                )}
                {r.treatment && (
                  <div className="bg-teal-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-0.5">Treatment</p>
                    <p className="text-sm text-slate-800">{r.treatment}</p>
                  </div>
                )}
              </div>

              {r.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-0.5">Doctor's Notes</p>
                  <p className="text-sm text-slate-700">{r.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
