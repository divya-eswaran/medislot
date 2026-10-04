import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      const routes = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(routes[user.role] || '/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Heart size={22} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">MediSlot</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Smart Healthcare<br />
            <span className="text-teal-300">Appointment</span><br />
            Management
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Book appointments, manage consultations, and access medical records — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { num: '500+', label: 'Doctors' },
              { num: '10K+', label: 'Patients' },
              { num: '98%', label: 'Satisfaction' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{s.num}</p>
                <p className="text-white/70 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-sm">© 2026 MediSlot. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 lg:rounded-l-3xl">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">MediSlot</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 gradient-primary text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500 mb-4">Demo credentials</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'Admin', email: 'admin@medislot.com', pwd: 'Admin@123' },
                  { role: 'Doctor', email: 'drjohn@medislot.com', pwd: 'Doctor@123' },
                  { role: 'Patient', email: 'alice@medislot.com', pwd: 'Patient@123' },
                ].map(d => (
                  <button
                    key={d.role}
                    onClick={() => setForm({ email: d.email, password: d.pwd })}
                    className="text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 rounded-lg px-2 py-2 transition-all"
                  >
                    {d.role}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              New patient?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
