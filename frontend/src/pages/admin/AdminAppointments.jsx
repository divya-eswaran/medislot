import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import { Card, Badge, Spinner, EmptyState, Modal, Button } from '../../components/ui'
import { Calendar, XCircle, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [cancelModal, setCancelModal] = useState(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getAppointments()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  const handleCancel = async () => {
    if (!reason.trim()) return toast.error('Reason required')
    setActionLoading(true)
    try {
      await adminAPI.cancelAppointment(cancelModal.id, reason)
      toast.success('Appointment cancelled')
      setCancelModal(null); setReason('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">All Appointments</h2>
        <p className="text-slate-500 text-sm mt-1">{appointments.length} total appointments</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${filter === t ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'}`}>
            {t} {filter === t ? `(${filtered.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Calendar} title="No appointments found" description="No appointments in this category." /></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['#', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => (
                  <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                    <td className="py-3 px-4">
                      {apt.tokenNumber ? (
                        <span className="w-8 h-8 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center">#{apt.tokenNumber}</span>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 text-sm">{apt.patientName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-700">Dr. {apt.doctorName}</p>
                      <p className="text-xs text-teal-600">{apt.specialization}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{apt.startTime}</td>
                    <td className="py-3 px-4"><Badge status={apt.status} /></td>
                    <td className="py-3 px-4">
                      {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                        <button onClick={() => setCancelModal(apt)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Cancel appointment for <strong>{cancelModal?.patientName}</strong> with <strong>Dr. {cancelModal?.doctorName}</strong>.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCancelModal(null)} className="flex-1 justify-center">Go Back</Button>
            <Button variant="danger" onClick={handleCancel} loading={actionLoading} className="flex-1 justify-center">Cancel Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
