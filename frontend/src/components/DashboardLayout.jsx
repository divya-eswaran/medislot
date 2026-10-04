import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationsAPI } from '../api/services'
import {
  Heart, Bell, LogOut, Menu, X, ChevronRight, User
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children, navItems, role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationsAPI.getUnreadCount()
      .then(res => setUnread(res.data.data ?? 0))
      .catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const roleColors = {
    ADMIN: 'from-purple-600 to-indigo-700',
    DOCTOR: 'from-teal-600 to-cyan-700',
    PATIENT: 'from-blue-600 to-blue-800',
  }
  const gradClass = roleColors[role] || 'from-blue-600 to-blue-800'

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-6 py-5 bg-gradient-to-r ${gradClass}`}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">MediSlot</p>
            <p className="text-white/70 text-xs capitalize">{role?.toLowerCase()} panel</p>
          </div>
          <button className="ml-auto lg:hidden text-white/80" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User chip */}
        <div className="mx-4 my-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto pb-4">
          <div className="space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${active
                      ? `bg-gradient-to-r ${gradClass} text-white shadow-md`
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={14} className="text-white/70" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
          <button className="lg:hidden text-slate-600 hover:text-slate-800" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <Link to={location.pathname.split('/').slice(0, 2).join('/') + '/notifications'} className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all">
              <Bell size={20} className="text-slate-600" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center text-white text-sm font-bold cursor-default`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
