import React, { useEffect, useState } from 'react'
import { patientAPI } from '../../api/services'
import { Card, Button, Input, Select, Spinner } from '../../components/ui'
import { User, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    patientAPI.getProfile()
      .then(r => { setProfile(r.data.data); setForm(r.data.data || {}) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await patientAPI.updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-14"><Spinner /></div>

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information</p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {form.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{form.name}</h3>
            <p className="text-slate-500 text-sm">{form.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name || ''} onChange={set('name')} icon={User} />
          <Input label="Phone Number" value={form.phone || ''} onChange={set('phone')} type="tel" />
          <Input label="Date of Birth" value={form.dateOfBirth || ''} onChange={set('dateOfBirth')} type="date" />
          <Select label="Gender" value={form.gender || 'MALE'} onChange={set('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
          <Input label="Blood Group" value={form.bloodGroup || ''} onChange={set('bloodGroup')} placeholder="e.g. A+" />
          <Input label="Emergency Contact" value={form.emergencyContact || ''} onChange={set('emergencyContact')} placeholder="+91 XXXXX XXXXX" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
          <textarea value={form.address || ''} onChange={set('address')} rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Allergies</label>
          <textarea value={form.allergies || ''} onChange={set('allergies')} rows={2} placeholder="List any known allergies..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Existing Conditions</label>
          <textarea value={form.existingConditions || ''} onChange={set('existingConditions')} rows={2} placeholder="e.g. Diabetes, Hypertension..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
        </div>

        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </Card>
    </div>
  )
}
