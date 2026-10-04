import api from './client'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
}

export const specializations = {
  getAll: () => api.get('/specializations'),
  getById: (id) => api.get(`/specializations/${id}`),
  create: (data) => api.post('/specializations', data),
  update: (id, data) => api.put(`/specializations/${id}`, data),
  delete: (id) => api.delete(`/specializations/${id}`),
}

export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id) => api.get(`/doctors/${id}/availability`),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
}

export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  getAppointments: () => api.get('/patient/appointments'),
  cancelAppointment: (id, reason) => api.put(`/patient/appointments/${id}/cancel`, { reason }),
  rescheduleAppointment: (id, data) => api.put(`/patient/appointments/${id}/reschedule`, data),
  getPrescriptions: () => api.get('/patient/prescriptions'),
  getMedicalRecords: () => api.get('/patient/medical-records'),
}

export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
  getAvailability: () => api.get('/doctor/availability'),
  updateAvailability: (data) => api.put('/doctor/availability', data),
  addBreak: (data) => api.post('/doctor/breaks', data),
  deleteBreak: (id) => api.delete(`/doctor/breaks/${id}`),
  addLeave: (data) => api.post('/doctor/leaves', data),
  deleteLeave: (id) => api.delete(`/doctor/leaves/${id}`),
  getAppointments: () => api.get('/doctor/appointments'),
  getTodayAppointments: () => api.get('/doctor/appointments/today'),
  cancelAppointment: (id, reason) => api.put(`/doctor/appointments/${id}/cancel`, { reason }),
  completeConsultation: (id, data) => api.post(`/doctor/appointments/${id}/consultation`, data),
  getPrescriptions: () => api.get('/doctor/prescriptions'),
  getMedicalRecords: () => api.get('/doctor/medical-records'),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDoctors: () => api.get('/admin/doctors'),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  approveDoctor: (id) => api.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id) => api.put(`/admin/doctors/${id}/reject`),
  activateDoctor: (id) => api.put(`/admin/doctors/${id}/activate`),
  deactivateDoctor: (id) => api.put(`/admin/doctors/${id}/deactivate`),
  getPatients: (search) => api.get('/admin/patients', { params: { search } }),
  activatePatient: (id) => api.put(`/admin/patients/${id}/activate`),
  deactivatePatient: (id) => api.put(`/admin/patients/${id}/deactivate`),
  getAppointments: () => api.get('/admin/appointments'),
  cancelAppointment: (id, reason) => api.put(`/admin/appointments/${id}/cancel`, { reason }),
  getSpecializations: () => api.get('/specializations'),
  createSpecialization: (data) => api.post('/specializations', data),
  updateSpecialization: (id, data) => api.put(`/specializations/${id}`, data),
  deleteSpecialization: (id) => api.delete(`/specializations/${id}`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}
