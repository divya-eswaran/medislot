import React, { useEffect, useState } from 'react'
import { notificationsAPI } from '../../api/services'
import { Card, Spinner, Button } from '../../components/ui'
import { Bell, CheckCheck, Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    notificationsAPI.getAll()
      .then(r => setNotifications(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAll = async () => {
    await notificationsAPI.markAllRead().catch(() => toast.error('Failed'))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All marked as read')
  }

  const typeColors = {
    APPOINTMENT_BOOKED: 'bg-blue-100 text-blue-600',
    APPOINTMENT_CANCELLED: 'bg-red-100 text-red-600',
    APPOINTMENT_CONFIRMED: 'bg-green-100 text-green-600',
    APPOINTMENT_COMPLETED: 'bg-teal-100 text-teal-600',
    APPOINTMENT_REJECTED: 'bg-rose-100 text-rose-600',
    REMINDER: 'bg-amber-100 text-amber-600',
    DEFAULT: 'bg-slate-100 text-slate-600',
  }

  const unread = notifications.filter(n => !n.read)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-slate-500 text-sm mt-1">{unread.length} unread notifications</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} className="gap-2">
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <Card className="p-10 text-center">
          <Bell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications yet</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-50">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 transition-all cursor-pointer ${!n.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.DEFAULT}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                {!n.read && <Circle size={10} className="text-blue-500 fill-blue-500 flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
