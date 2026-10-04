import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', gender: 'MALE', dateOfBirth: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const { name, email, password, phone, gender, dateOfBirth } = form
      await register({ fullName: name, email, password, phone, gender, dateOfBirth })
      await login(email, password)
      toast.success('Account created! Welcome to MediSlot.')
      navigate('/patient')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-12 text-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart size={22} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-bold">MediSlot</span>
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Join <span className="text-teal-300">Thousands</span><br />of Patients
        </h1>
        <p className="text-white/70 text-lg mb-10">
          Get instant access to top-rated doctors, seamless scheduling, and your complete health records.
        </p>
        <div className="space-y-4">
          {['Book appointments 24/7', 'View prescriptions & records', 'Get timely notifications', 'Token-based scheduling'].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80">
              <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 lg:rounded-l-3xl overflow-y-auto py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create account</h2>
            <p className="text-slate-500 text-sm mb-6">Sign up as a patient</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                  <select value={form.gender} onChange={set('gender')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 gradient-primary text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</> : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
