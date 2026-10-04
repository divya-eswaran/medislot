import React, { useEffect, useState } from 'react'
import { adminAPI, specializations as specAPI } from '../../api/services'
import { Card, Badge, Button, Modal, Input, Select, Spinner, EmptyState } from '../../components/ui'
import { Stethoscope, Plus, CheckCircle, XCircle, UserCheck, UserX, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [specs, setSpecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      await adminAPI.createDoctor({ ...form, specializationId: parseInt(form.specializationId), consultationFee: parseFloat(form.consultationFee) || 0, experienceYears: parseInt(form.experienceYears) || 0 })
      toast.success('Doctor created!')
      setCreateModal(false)
      setForm({ name: '', email: '', password: 'Doctor@123', phone: '', qualification: '', specializationId: '', consultationFee: '', experienceYears: '', gender: 'MALE' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const action = async (fn, id, label) => {
    setActionLoading(id + label)
    try { await fn(id); toast.success(`${label} success`); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoading('') }
  }

  const filtered = doctors.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Doctors</h2>
          <p className="text-slate-500 text-sm mt-1">{doctors.length} doctors registered</p>
        </div>
        <Button onClick={() => setCreateModal(true)} className="gap-2">
          <Plus size={16} /> Add Doctor
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white" />
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Stethoscope} title="No doctors found" description="Add a doctor to get started." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(doc => (
            <Card key={doc.id} className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {doc.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-bold text-slate-800">Dr. {doc.name}</p>
                    <Badge status={doc.status} />
                  </div>
                  <p className="text-sm text-teal-600">{doc.specializationName}</p>
                  <p className="text-xs text-slate-500">{doc.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                <span>📚 {doc.qualification || 'N/A'}</span>
                <span>💰 ₹{doc.consultationFee || 0}</span>
                <span>📅 {doc.experienceYears || 0} yrs exp</span>
                <span>📞 {doc.phone || 'N/A'}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {doc.status === 'PENDING_APPROVAL' && (
                  <>
                    <button onClick={() => action(adminAPI.approveDoctor, doc.id, 'Approve')} disabled={!!actionLoading}
                      className="flex-1 py-1.5 text-xs font-semibold text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => action(adminAPI.rejectDoctor, doc.id, 'Reject')} disabled={!!actionLoading}
                      className="flex-1 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1">
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                )}
                {doc.status === 'ACTIVE' && (
                  <button onClick={() => action(adminAPI.deactivateDoctor, doc.id, 'Deactivate')} disabled={!!actionLoading}
                    className="flex-1 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-1">
                    <UserX size={12} /> Deactivate
                  </button>
                )}
                {['INACTIVE', 'REJECTED'].includes(doc.status) && (
                  <button onClick={() => action(adminAPI.activateDoctor, doc.id, 'Activate')} disabled={!!actionLoading}
                    className="flex-1 py-1.5 text-xs font-semibold text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-1">
                    <UserCheck size={12} /> Activate
                  </button>
                )}
              </div>
            </Card>
          ))}
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
