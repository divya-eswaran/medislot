import React, { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import { Card, Button, Modal, Spinner } from '../../components/ui'
import { Clock, Plus, Trash2, Save, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default function DoctorSchedule() {
  const [avail, setAvail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    startTime: '09:00', endTime: '17:00', slotDuration: 20, maxTokensPerDay: 20
  })
  const [breakModal, setBreakModal] = useState(false)
  const [leaveModal, setLeaveModal] = useState(false)
  const [newBreak, setNewBreak] = useState({ title: '', startTime: '', endTime: '' })
  const [newLeave, setNewLeave] = useState({ date: '', reason: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    doctorAPI.getAvailability()
      .then(r => {
        const d = r.data.data
        setAvail(d)
        if (d) {
          setForm({
            workingDays: d.workingDays || [],
            startTime: d.startTime || '09:00',
            endTime: d.endTime || '17:00',
            slotDuration: d.slotDurationMinutes || 20,
            maxTokensPerDay: d.maxTokensPerDay || 20,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      workingDays: p.workingDays.includes(day)
        ? p.workingDays.filter(d => d !== day)
        : [...p.workingDays, day]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await doctorAPI.updateAvailability({
        workingDays: form.workingDays,
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMinutes: parseInt(form.slotDuration),
        maxTokensPerDay: parseInt(form.maxTokensPerDay),
      })
      toast.success('Schedule saved!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addBreak = async () => {
    if (!newBreak.title || !newBreak.startTime || !newBreak.endTime) return toast.error('Fill all break fields')
    setActionLoading(true)
    try {
      await doctorAPI.addBreak(newBreak)
      toast.success('Break added')
      setBreakModal(false)
      setNewBreak({ title: '', startTime: '', endTime: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteBreak = async (id) => {
    try {
      await doctorAPI.deleteBreak(id)
      toast.success('Break removed')
      load()
    } catch { toast.error('Failed') }
  }

  const addLeave = async () => {
    if (!newLeave.date) return toast.error('Select a date')
    setActionLoading(true)
    try {
      await doctorAPI.addLeave(newLeave)
      toast.success('Leave added')
      setLeaveModal(false)
      setNewLeave({ date: '', reason: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteLeave = async (id) => {
    try {
      await doctorAPI.deleteLeave(id)
      toast.success('Leave removed')
      load()
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-14"><Spinner /></div>

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Schedule</h2>
        <p className="text-slate-500 text-sm mt-1">Configure availability, breaks and leaves</p>
      </div>

      {/* Working schedule */}
      <Card className="p-6 space-y-5">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-teal-600" /> Working Hours</h3>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Working Days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                  ${form.workingDays.includes(day) ? 'bg-teal-600 text-white shadow-md shadow-teal-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
            <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
            <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Slot Duration (min)</label>
            <input type="number" min={10} max={60} value={form.slotDuration} onChange={e => setForm(p => ({ ...p, slotDuration: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Tokens/Day</label>
            <input type="number" min={1} max={100} value={form.maxTokensPerDay} onChange={e => setForm(p => ({ ...p, maxTokensPerDay: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          </div>
        </div>

        <Button variant="teal" onClick={handleSave} loading={saving} className="gap-2">
          <Save size={16} /> Save Schedule
        </Button>
      </Card>

      {/* Breaks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Breaks</h3>
          <Button variant="outline" size="sm" onClick={() => setBreakModal(true)} className="gap-1">
            <Plus size={14} /> Add Break
          </Button>
        </div>
        {avail?.breaks?.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No breaks configured</p>
        ) : (
          <div className="space-y-2">
            {avail?.breaks?.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{b.title}</p>
                  <p className="text-xs text-slate-500">{b.startTime} – {b.endTime}</p>
                </div>
                <button onClick={() => deleteBreak(b.id)} className="text-red-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Leaves / Unavailable Dates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Unavailable Dates / Leaves</h3>
          <Button variant="outline" size="sm" onClick={() => setLeaveModal(true)} className="gap-1">
            <Plus size={14} /> Add Leave
          </Button>
        </div>
        {avail?.unavailableDates?.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No leaves marked</p>
        ) : (
          <div className="space-y-2">
            {avail?.unavailableDates?.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <Calendar size={16} className="text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{l.date}</p>
                  {l.reason && <p className="text-xs text-slate-500">{l.reason}</p>}
                </div>
                <button onClick={() => deleteLeave(l.id)} className="text-red-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Break Modal */}
      <Modal isOpen={breakModal} onClose={() => setBreakModal(false)} title="Add Break">
        <div className="space-y-4">
          <input value={newBreak.title} onChange={e => setNewBreak(p => ({ ...p, title: e.target.value }))} placeholder="Break title (e.g. Lunch Break)"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
              <input type="time" value={newBreak.startTime} onChange={e => setNewBreak(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
              <input type="time" value={newBreak.endTime} onChange={e => setNewBreak(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setBreakModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button variant="teal" onClick={addBreak} loading={actionLoading} className="flex-1 justify-center">Add Break</Button>
          </div>
        </div>
      </Modal>

      {/* Add Leave Modal */}
      <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} title="Mark Leave">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input type="date" value={newLeave.date} onChange={e => setNewLeave(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <input value={newLeave.reason} onChange={e => setNewLeave(p => ({ ...p, reason: e.target.value }))} placeholder="Reason (optional)"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setLeaveModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button variant="teal" onClick={addLeave} loading={actionLoading} className="flex-1 justify-center">Add Leave</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
