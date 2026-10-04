import React from 'react'

// Main card container
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
)

// Stat card with icon
export const StatCard = ({ label, value, icon: Icon, color = 'blue', trend }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    rose: 'from-rose-500 to-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

// Status badge
export const Badge = ({ status }) => {
  const s = (status || '').toLowerCase().replace(' ', '_')
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold badge-${s} capitalize`}>
      {(status || '').replace(/_/g, ' ')}
    </span>
  )
}

// Button component
export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '', loading }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-200',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md shadow-green-200',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    teal: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md shadow-teal-200',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3 text-base rounded-xl',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// Input component
export const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border rounded-xl text-sm transition-all outline-none
          ${error ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-white focus:border-blue-500 hover:border-slate-300'}
          focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-blue-100'} ${props.className || ''}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

// Select component
export const Select = ({ label, error, children, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <select
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none appearance-none cursor-pointer
        ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-blue-500 hover:border-slate-300'}
        focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-blue-100'} ${props.className || ''}`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

// Textarea component
export const Textarea = ({ label, error, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none resize-none
        ${error ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-white focus:border-blue-500 hover:border-slate-300'}
        focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-blue-100'} ${props.className || ''}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

// Loading spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  )
}

// Empty state
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <Icon size={36} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>
    {action}
  </div>
)

// Modal
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Table
export const Table = ({ headers, children, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-100">
          {headers.map((h, i) => (
            <th key={i} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
    {empty}
  </div>
)
