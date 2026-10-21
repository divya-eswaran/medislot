/**
 * Helper to clean and format doctor names properly.
 * Prevents duplicated prefixes like "Dr. Dr. Ramesh Sharma"
 * and ensures a doctor's name is always neatly prefixed with "Dr. "
 */
export function formatDoctorName(name) {
  if (!name || typeof name !== 'string') return ''
  const trimmed = name.trim()
  if (!trimmed) return ''
  
  // Strip any existing "Dr." or "Dr" prefixes (case-insensitive, even multiple like "Dr. Dr.")
  const cleanName = trimmed.replace(/^(dr\.?\s*)+/i, '').trim()
  if (!cleanName) return trimmed
  
  return `Dr. ${cleanName}`
}

/**
 * Returns the doctor's initial for avatars (excluding "Dr.")
 */
export function getDoctorInitial(name) {
  if (!name || typeof name !== 'string') return 'D'
  const clean = name.trim().replace(/^(dr\.?\s*)+/i, '').trim()
  return (clean.charAt(0) || 'D').toUpperCase()
}

/**
 * Checks if an appointment date & time is in the future
 */
export function isUpcomingAppointment(dateStr, timeStr) {
  if (!dateStr) return false
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Parse dateStr (e.g. "2026-09-30")
    const [year, month, day] = dateStr.split('-').map(Number)
    const apptDate = new Date(year, month - 1, day)
    apptDate.setHours(0, 0, 0, 0)
    
    if (apptDate.getTime() > today.getTime()) return true
    if (apptDate.getTime() < today.getTime()) return false
    
    // Same day: check time
    if (!timeStr) return true
    const [hours, minutes] = timeStr.split(':').map(Number)
    const now = new Date()
    const apptTime = new Date()
    apptTime.setHours(hours || 0, minutes || 0, 0, 0)
    
    return apptTime > now
  } catch {
    return false
  }
}
