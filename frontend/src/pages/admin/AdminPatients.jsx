import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import { Card, Badge, Spinner, EmptyState } from '../../components/ui'
import { Users, UserCheck, UserX, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const load = () => {
    setLoading(true)
    adminAPI.getPatients(search)
      .then(r => setPatients(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const action = async (fn, id, label) => {
    setActionLoading(id + label)
    try { await fn(id); toast.success(`${label} success`); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoading('') }
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Manage Patients</h2>
        <p className="text-slate-500 text-sm mt-1">{patients.length} patients registered</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white" />
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No patients found" description="Patients will appear here after registration." /></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Patient', 'Email', 'Phone', 'Gender', 'Blood Group', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {p.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{p.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{p.phone || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 capitalize">{p.gender?.toLowerCase() || '—'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{p.bloodGroup || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge status={p.active !== false ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3 px-4">
                      {p.active !== false ? (
                        <button onClick={() => action(adminAPI.deactivatePatient, p.id, 'Deactivate')} disabled={!!actionLoading}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-700 border border-amber-300 px-2 py-1 rounded-lg hover:bg-amber-50 transition-all">
                          <UserX size={12} /> Deactivate
                        </button>
                      ) : (
                        <button onClick={() => action(adminAPI.activatePatient, p.id, 'Activate')} disabled={!!actionLoading}
                          className="flex items-center gap-1 text-xs font-semibold text-green-700 border border-green-300 px-2 py-1 rounded-lg hover:bg-green-50 transition-all">
                          <UserCheck size={12} /> Activate
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
    </div>
  )
}
