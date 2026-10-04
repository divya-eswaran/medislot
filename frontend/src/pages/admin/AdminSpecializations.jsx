import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import { Card, Button, Modal, Input, Spinner, EmptyState } from '../../components/ui'
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSpecializations() {
  const [specs, setSpecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | {id, name, description}
  const [form, setForm] = useState({ name: '', description: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getSpecializations()
      .then(r => setSpecs(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openEdit = (s) => { setForm({ name: s.name, description: s.description || '' }); setModal(s) }
  const openCreate = () => { setForm({ name: '', description: '' }); setModal('create') }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    setActionLoading(true)
    try {
      if (modal === 'create') {
        await adminAPI.createSpecialization(form)
        toast.success('Specialization created!')
      } else {
        await adminAPI.updateSpecialization(modal.id, form)
        toast.success('Updated!')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this specialization?')) return
    try {
      await adminAPI.deleteSpecialization(id)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed — it may be in use')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Specializations</h2>
          <p className="text-slate-500 text-sm mt-1">{specs.length} specializations</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Add Specialization
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : specs.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="No specializations" description="Add specializations to assign to doctors." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.map(s => (
            <Card key={s.id} className="p-5 card-hover">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button onClick={() => openEdit(s)} className="flex-1 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex-1 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Specialization' : 'Edit Specialization'}>
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Cardiology" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief description..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleSave} loading={actionLoading} className="flex-1 justify-center">
              {modal === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
