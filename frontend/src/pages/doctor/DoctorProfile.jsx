import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import { Card, Button, Input, Select, Spinner } from '../../components/ui'
import { User, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDoctorName, getDoctorInitial } from '../../utils/formatters'

export default function DoctorProfile() {
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    doctorAPI.getProfile()
      .then(r => setForm(r.data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await doctorAPI.updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-14"><Spinner /></div>

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your professional information</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {getDoctorInitial(form.fullName || form.name)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{formatDoctorName(form.fullName || form.name)}</h3>
            <p className="text-slate-500 text-sm">{form.email}</p>
            <p className="text-teal-600 text-sm font-medium">{form.specializationName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name || ''} onChange={set('name')} icon={User} />
          <Input label="Phone" value={form.phone || ''} onChange={set('phone')} type="tel" />
          <Input label="Qualification" value={form.qualification || ''} onChange={set('qualification')} placeholder="e.g. MBBS, MD" />
          <Input label="Consultation Fee (₹)" value={form.consultationFee || ''} onChange={set('consultationFee')} type="number" />
          <Input label="Experience (Years)" value={form.experienceYears || ''} onChange={set('experienceYears')} type="number" />
          <Select label="Gender" value={form.gender || 'MALE'} onChange={set('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          <textarea value={form.bio || ''} onChange={set('bio')} rows={3} placeholder="Brief professional bio..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none" />
        </div>

        <Button variant="teal" onClick={handleSave} loading={saving} className="gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </Card>
    </div>
  )
}
