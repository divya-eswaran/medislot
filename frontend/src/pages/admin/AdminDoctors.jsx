import React, { useEffect, useState } from 'react'
import { adminAPI, specializations as specAPI } from '../../api/services'
import { Card, Badge, Button, Modal, Input, Select, Spinner, EmptyState } from '../../components/ui'
import { Stethoscope, Plus, CheckCircle, XCircle, UserCheck, UserX, Search, Clock, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDoctorName, getDoctorInitial } from '../../utils/formatters'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [specs, setSpecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [createModal, setCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: 'Doctor@123', phone: '', qualification: '', specializationId: '', consultationFee: '', experienceYears: '', gender: 'MALE' })

  const load = () => {
    setLoading(true)
    Promise.all([adminAPI.getDoctors(), specAPI.getAll()])
      .then(([dr, sp]) => { setDoctors(dr.data.data || []); setSpecs(sp.data.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.specializationId) return toast.error('Fill required fields')
    setActionLoading('create')
    try {
      await adminAPI.createDoctor({
        ...form,
        fullName: form.name.trim(),
        name: form.name.trim(),
        specializationId: parseInt(form.specializationId),
        consultationFee: parseFloat(form.consultationFee) || 0,
        experienceYears: parseInt(form.experienceYears) || 0
      })
      toast.success('Doctor account created successfully!')
      setCreateModal(false)
      setForm({ name: '', email: '', password: 'Doctor@123', phone: '', qualification: '', specializationId: '', consultationFee: '', experienceYears: '', gender: 'MALE' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor')
    } finally {
      setActionLoading('')
    }
  }

  const action = async (fn, id, label) => {
    setActionLoading(id + label)
    try {
      await fn(id)
      toast.success(`${label} successful`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading('')
    }
  }

  const pendingCount = doctors.filter(d => d.status === 'PENDING' || d.status === 'PENDING_APPROVAL').length
  const approvedCount = doctors.filter(d => d.status === 'APPROVED').length

  const filtered = doctors.filter(d => {
    const docName = (d.fullName || d.name || '').toLowerCase()
    const matchesSearch = docName.includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (filter === 'ALL') return true
    if (filter === 'PENDING') return d.status === 'PENDING' || d.status === 'PENDING_APPROVAL'
    if (filter === 'APPROVED') return d.status === 'APPROVED'
    if (filter === 'REJECTED') return d.status === 'REJECTED'
    return true
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Doctors</h2>
          <p className="text-slate-500 text-sm mt-1">
            {doctors.length} doctors registered · {pendingCount} awaiting approval
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)} className="gap-2">
          <Plus size={16} /> Add Doctor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: `ALL (${doctors.length})` },
          { key: 'PENDING', label: `PENDING APPROVAL (${pendingCount})`, highlight: pendingCount > 0 },
          { key: 'APPROVED', label: `APPROVED (${approvedCount})` },
          { key: 'REJECTED', label: 'REJECTED' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5
              ${filter === t.key
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : t.highlight
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold hover:bg-amber-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'}`}
          >
            {t.highlight && <Clock size={13} className="text-amber-700" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by doctor name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Stethoscope} title="No doctors found" description="No doctors match the selected filter." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(doc => {
            const isPending = doc.status === 'PENDING' || doc.status === 'PENDING_APPROVAL'
            const isApproved = doc.status === 'APPROVED'
            const isRejected = doc.status === 'REJECTED'
            const formattedName = formatDoctorName(doc.fullName || doc.name)
            const initial = getDoctorInitial(doc.fullName || doc.name)

            return (
              <Card key={doc.id} className={`p-5 transition-all ${isPending ? 'border-amber-300 bg-amber-50/20 shadow-md ring-1 ring-amber-200' : ''}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm
                    ${isPending ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-teal-500 to-cyan-700'}`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-slate-800 text-base">{formattedName}</p>
                      <Badge status={doc.status} />
                      {!doc.active && doc.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-teal-600 font-medium">{doc.specializationName || 'General'}</p>
                    <p className="text-xs text-slate-500">{doc.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span>📚 <strong>Qual:</strong> {doc.qualification || 'N/A'}</span>
                  <span>💰 <strong>Fee:</strong> ₹{doc.consultationFee || 0}</span>
                  <span>📅 <strong>Exp:</strong> {doc.experienceYears || 0} yrs</span>
                  <span>📞 <strong>Phone:</strong> {doc.phone || 'N/A'}</span>
                </div>

                {isPending && (
                  <div className="mb-3 px-3 py-2 bg-amber-100/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                    <Clock size={14} className="text-amber-700 flex-shrink-0" />
                    <span><strong>Pending Approval:</strong> Needs admin approval before patients can book appointments.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                  {isPending && (
                    <>
                      <button
                        onClick={() => action(adminAPI.approveDoctor, doc.id, 'Approve')}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle size={14} /> Approve Doctor
                      </button>
                      <button
                        onClick={() => action(adminAPI.rejectDoctor, doc.id, 'Reject')}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}

                  {isApproved && doc.active && (
                    <button
                      onClick={() => action(adminAPI.deactivateDoctor, doc.id, 'Deactivate')}
                      disabled={!!actionLoading}
                      className="flex-1 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <UserX size={13} /> Deactivate
                    </button>
                  )}

                  {isApproved && !doc.active && (
                    <button
                      onClick={() => action(adminAPI.activateDoctor, doc.id, 'Activate')}
                      disabled={!!actionLoading}
                      className="flex-1 py-1.5 text-xs font-semibold text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck size={13} /> Activate
                    </button>
                  )}

                  {isRejected && (
                    <>
                      <button
                        onClick={() => action(adminAPI.approveDoctor, doc.id, 'Approve')}
                        disabled={!!actionLoading}
                        className="flex-1 py-1.5 text-xs font-semibold text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck size={13} /> Re-Approve
                      </button>
                      <button
                        onClick={() => action(adminAPI.activateDoctor, doc.id, 'Activate')}
                        disabled={!!actionLoading}
                        className="flex-1 py-1.5 text-xs font-semibold text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck size={13} /> Activate
                      </button>
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Doctor Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Add New Doctor" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.name} onChange={set('name')} placeholder="Dr. Jane Smith" />
          <Input label="Email *" value={form.email} onChange={set('email')} type="email" placeholder="doctor@medislot.com" />
          <Input label="Password" value={form.password} onChange={set('password')} type="password" />
          <Input label="Phone" value={form.phone} onChange={set('phone')} type="tel" />
          <Input label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD" />
          <Select label="Specialization *" value={form.specializationId} onChange={set('specializationId')}>
            <option value="">Select...</option>
            {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="Consultation Fee (₹)" value={form.consultationFee} onChange={set('consultationFee')} type="number" />
          <Input label="Experience (Years)" value={form.experienceYears} onChange={set('experienceYears')} type="number" />
          <Select label="Gender" value={form.gender} onChange={set('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setCreateModal(false)} className="flex-1 justify-center">Cancel</Button>
          <Button onClick={handleCreate} loading={actionLoading === 'create'} className="flex-1 justify-center">Create Doctor</Button>
        </div>
      </Modal>
    </div>
  )
}
