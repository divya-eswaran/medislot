import React, { useEffect, useState } from 'react'
import { patientAPI } from '../../api/services'
import { Card, Badge, Modal, Button, Spinner, EmptyState } from '../../components/ui'
import { Calendar, AlertCircle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    patientAPI.getAppointments()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error('Please provide a cancellation reason')
    setActionLoading(true)
    try {
      await patientAPI.cancelAppointment(cancelModal.id, cancelReason)
      toast.success('Appointment cancelled')
      setCancelModal(null)
      setCancelReason('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Appointments</h2>
        <p className="text-slate-500 text-sm mt-1">Track all your scheduled visits</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${filter === t ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-14"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments found" description="Book an appointment to get started." />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(apt => (
              <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Token */}
                {apt.tokenNumber && (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-[10px] font-medium opacity-80">Token</span>
                    <span className="text-lg font-bold leading-none">#{apt.tokenNumber}</span>
                  </div>
                )}

                {/* Doctor avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {apt.doctorName?.charAt(0) || 'D'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800">Dr. {apt.doctorName}</p>
                    <Badge status={apt.status} />
                  </div>
                  <p className="text-sm text-teal-600 mb-1">{apt.specialization}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd, yyyy') : '—'}
                    </span>
                    <span>{apt.startTime} – {apt.endTime}</span>
                    {apt.reason && <span>· {apt.reason}</span>}
                  </div>
                  {apt.cancellationReason && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {apt.cancellationReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                    <button onClick={() => setCancelModal(apt)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Cancelling appointment with <strong>Dr. {cancelModal?.doctorName}</strong> on {cancelModal?.appointmentDate}.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Cancellation *</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
              placeholder="Please provide a reason..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCancelModal(null)} className="flex-1 justify-center">Keep Appointment</Button>
            <Button variant="danger" onClick={handleCancel} loading={actionLoading} className="flex-1 justify-center">Confirm Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
