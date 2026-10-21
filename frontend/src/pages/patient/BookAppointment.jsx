import React, { useEffect, useState } from 'react'
import { doctorsAPI, specializations, patientAPI } from '../../api/services'
import { Card, Button, Badge, Modal, Spinner } from '../../components/ui'
import { Search, Filter, Star, Clock, Calendar, ChevronRight, User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { formatDoctorName, getDoctorInitial } from '../../utils/formatters'

export default function BookAppointment() {
  const [step, setStep] = useState(1) // 1=pick doctor, 2=pick slot, 3=confirm
  const [specs, setSpecs] = useState([])
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [specFilter, setSpecFilter] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    specializations.getAll().then(r => setSpecs(r.data.data || []))
    doctorsAPI.getAll({ status: 'ACTIVE' }).then(r => {
      const data = r.data.data || []
      setDoctors(data)
      setFilteredDoctors(data)
    })
  }, [])

  useEffect(() => {
    let d = doctors
    if (specFilter) d = d.filter(doc => doc.specializationId == specFilter || doc.specializationName === specFilter)
    if (search) {
      d = d.filter(doc => {
        const name = (doc.fullName || doc.name || '').toLowerCase()
        return name.includes(search.toLowerCase())
      })
    }
    setFilteredDoctors(d)
  }, [search, specFilter, doctors])

  const loadSlots = (doctorId, date) => {
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    doctorsAPI.getSlots(doctorId, date)
      .then(r => setSlots(r.data.data || []))
      .catch(() => toast.error('Could not load slots'))
      .finally(() => setSlotsLoading(false))
  }

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc)
    setStep(2)
    loadSlots(doc.id, selectedDate)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    if (selectedDoctor) loadSlots(selectedDoctor.id, e.target.value)
  }

  const handleBook = async () => {
    setLoading(true)
    try {
      const res = await patientAPI.bookAppointment({
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason,
      })
      setSuccess(res.data.data)
      setStep(4)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1); setSelectedDoctor(null); setSelectedSlot(null)
    setReason(''); setSuccess(null); setSlots([])
  }

  // Step breadcrumb
  const steps = ['Choose Doctor', 'Pick Slot', 'Confirm']

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>
        <p className="text-slate-500 text-sm mt-1">Find a doctor and schedule your visit</p>
      </div>

      {/* Breadcrumb */}
      {step < 4 && (
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${step === i + 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {step > i + 1 ? <CheckCircle size={14} /> : <span className="w-4 h-4 flex items-center justify-center text-xs">{i + 1}</span>}
                {s}
              </div>
              {i < 2 && <ChevronRight size={14} className="text-slate-400" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1: Pick Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search doctors..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none bg-white min-w-40">
                  <option value="">All Specializations</option>
                  {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Doctor grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover cursor-pointer"
                onClick={() => handleSelectDoctor(doc)}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {getDoctorInitial(doc.fullName || doc.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{formatDoctorName(doc.fullName || doc.name)}</h3>
                    <p className="text-sm text-teal-600 font-medium">{doc.specializationName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.qualification}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                  <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" />{doc.slotDurationMinutes || 20} min/slot</span>
                  {doc.consultationFee && <span className="flex items-center gap-1 text-green-700 font-semibold">₹{doc.consultationFee}</span>}
                </div>
                <button className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                  Book Slot <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
          {filteredDoctors.length === 0 && (
            <Card className="p-10 text-center">
              <User size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No doctors found</p>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Pick Slot */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-blue-600 transition-all">← Back</button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Doctor info */}
            <Card className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {getDoctorInitial(selectedDoctor.fullName || selectedDoctor.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{formatDoctorName(selectedDoctor.fullName || selectedDoctor.name)}</h3>
                  <p className="text-sm text-teal-600">{selectedDoctor.specializationName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Date</label>
                <input type="date" value={selectedDate} onChange={handleDateChange}
                  min={format(addDays(new Date(), 0), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </Card>

            {/* Slots */}
            <div className="lg:col-span-2">
              <Card className="p-5">
                <h3 className="font-bold text-slate-800 mb-4">Available Slots — {format(new Date(selectedDate + 'T00:00:00'), 'MMMM dd, yyyy')}</h3>
                {slotsLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot, i) => (
                      <button key={i}
                        disabled={!slot.available || slot.break}
                        onClick={() => { setSelectedSlot(slot); setStep(3) }}
                        className={`p-2.5 rounded-xl text-xs font-medium transition-all border
                          ${slot.break ? 'bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed'
                            : !slot.available || slot.booked ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer shadow-sm'}`}>
                        {slot.startTime}
                        {slot.break && <span className="block text-[10px] mt-0.5 truncate">{slot.breakTitle}</span>}
                        {!slot.break && slot.available && !slot.booked && (
                          <span className="block text-[10px] mt-0.5 text-teal-500">#{slot.estimatedTokenNumber}</span>
                        )}
                        {slot.booked && <span className="block text-[10px] mt-0.5">Booked</span>}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <div className="max-w-lg space-y-4">
          <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-blue-600">← Back</button>

          <Card className="p-6 space-y-5">
            <h3 className="font-bold text-slate-800 text-lg">Confirm Booking</h3>

            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Doctor</span>
                <span className="font-semibold text-slate-800">{formatDoctorName(selectedDoctor.fullName || selectedDoctor.name)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Specialization</span>
                <span className="font-semibold text-slate-800">{selectedDoctor.specializationName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Date</span>
                <span className="font-semibold text-slate-800">{format(new Date(selectedDate + 'T00:00:00'), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Time</span>
                <span className="font-semibold text-slate-800">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Token #</span>
                <span className="font-bold text-blue-700">#{selectedSlot.estimatedTokenNumber}</span>
              </div>
              {selectedDoctor.consultationFee && (
                <div className="flex justify-between text-sm border-t border-blue-200 pt-2 mt-2">
                  <span className="text-slate-600">Fee</span>
                  <span className="font-bold text-green-700">₹{selectedDoctor.consultationFee}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Visit</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder="Describe your symptoms or reason..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>

            <Button onClick={handleBook} loading={loading} className="w-full justify-center">
              Confirm Booking
            </Button>
          </Card>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && success && (
        <div className="max-w-lg mx-auto">
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-500 text-sm mb-6">Your appointment has been successfully booked.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Token Number</span>
                <span className="font-bold text-blue-700 text-lg">#{success.tokenNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-semibold">{formatDoctorName(success.doctorName)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-semibold">{success.appointmentDate} · {success.startTime}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-2.5 border border-blue-600 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all">
                Book Another
              </button>
              <a href="/patient/appointments" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all text-center">
                My Appointments
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
