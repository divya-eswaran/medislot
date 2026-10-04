import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import { Card, Badge, Modal, Button, Spinner, EmptyState, Textarea } from '../../components/ui'
import { Calendar, CheckCircle, XCircle, Stethoscope, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [consultModal, setConsultModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Consultation form state
  const [consult, setConsult] = useState({
    chiefComplaint: '', vitalSigns: '', diagnosis: '', treatment: '', notes: '', followUpDate: '',
    prescriptionDiagnosis: '', prescriptionNotes: '',
    items: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  })

  const load = () => {
    setLoading(true)
    doctorAPI.getAppointments()
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  const setConsultField = (k) => (e) => setConsult(p => ({ ...p, [k]: e.target.value }))
  const setItem = (idx, k) => (e) => {
    const items = [...consult.items]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setConsult(p => ({ ...p, items }))
  }
  const addItem = () => setConsult(p => ({ ...p, items: [...p.items, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] }))
  const removeItem = (idx) => setConsult(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))

  const handleConsult = async () => {
    if (!consult.diagnosis.trim()) return toast.error('Please enter a diagnosis')
    setActionLoading(true)
    try {
      await doctorAPI.completeConsultation(consultModal.id, {
        chiefComplaint: consult.chiefComplaint,
        vitalSigns: consult.vitalSigns,
        diagnosis: consult.diagnosis,
        treatment: consult.treatment,
        notes: consult.notes,
        followUpDate: consult.followUpDate || null,
        prescription: {
          diagnosis: consult.prescriptionDiagnosis || consult.diagnosis,
          notes: consult.prescriptionNotes,
          items: consult.items.filter(i => i.medicineName.trim()),
        }
      })
      toast.success('Consultation completed!')
      setConsultModal(null)
      setConsult({ chiefComplaint: '', vitalSigns: '', diagnosis: '', treatment: '', notes: '', followUpDate: '', prescriptionDiagnosis: '', prescriptionNotes: '', items: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error('Reason required')
    setActionLoading(true)
    try {
      await doctorAPI.cancelAppointment(cancelModal.id, cancelReason)
      toast.success('Appointment cancelled')
      setCancelModal(null); setCancelReason('')
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
        <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your patient appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${filter === t ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-14"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments found" description="Appointments will appear here." />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(apt => (
              <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Token */}
                {apt.tokenNumber && (
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0
                    ${apt.status === 'COMPLETED' ? 'bg-green-500' : apt.status === 'CANCELLED' ? 'bg-red-400' : 'bg-teal-600'}`}>
                    <span className="text-[9px]">Token</span>
                    <span className="font-bold">#{apt.tokenNumber}</span>
                  </div>
                )}

                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                  {apt.patientName?.charAt(0) || 'P'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800">{apt.patientName}</p>
                    <Badge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd, yyyy') : '—'} · {apt.startTime} – {apt.endTime}
                  </p>
                  {apt.reason && <p className="text-xs text-slate-500 mt-0.5">Reason: {apt.reason}</p>}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {['CONFIRMED', 'PENDING'].includes(apt.status) && (
                    <>
                      <button onClick={() => setConsultModal(apt)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-all flex items-center gap-1">
                        <Stethoscope size={13} /> Complete
                      </button>
                      <button onClick={() => setCancelModal(apt)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Consultation Modal */}
      <Modal isOpen={!!consultModal} onClose={() => setConsultModal(null)} title={`Complete Consultation — ${consultModal?.patientName}`} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chief Complaint</label>
              <input value={consult.chiefComplaint} onChange={setConsultField('chiefComplaint')} placeholder="e.g. Fever, headache..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Vital Signs</label>
              <input value={consult.vitalSigns} onChange={setConsultField('vitalSigns')} placeholder="BP, Temp, Pulse..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Diagnosis *</label>
            <textarea value={consult.diagnosis} onChange={setConsultField('diagnosis')} rows={2} placeholder="Primary diagnosis..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Treatment Plan</label>
              <textarea value={consult.treatment} onChange={setConsultField('treatment')} rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Follow-up Date</label>
              <input type="date" value={consult.followUpDate} onChange={setConsultField('followUpDate')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea value={consult.notes} onChange={setConsultField('notes')} rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
          </div>

          {/* Prescription */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Prescription Medications</h4>
              <button onClick={addItem} className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1">
                <Plus size={13} /> Add Medicine
              </button>
            </div>
            <div className="space-y-3">
              {consult.items.map((item, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl relative">
                  <input value={item.medicineName} onChange={setItem(i, 'medicineName')} placeholder="Medicine name"
                    className="col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-400" />
                  <input value={item.dosage} onChange={setItem(i, 'dosage')} placeholder="Dosage"
                    className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-400" />
                  <input value={item.frequency} onChange={setItem(i, 'frequency')} placeholder="Frequency"
                    className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-400" />
                  <div className="flex gap-1">
                    <input value={item.duration} onChange={setItem(i, 'duration')} placeholder="Duration"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-400" />
                    {consult.items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 px-1">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setConsultModal(null)} className="flex-1 justify-center">Cancel</Button>
            <Button variant="teal" onClick={handleConsult} loading={actionLoading} className="flex-1 justify-center">
              <CheckCircle size={16} /> Complete Consultation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Cancelling appointment for <strong>{cancelModal?.patientName}</strong>.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason *</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
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
