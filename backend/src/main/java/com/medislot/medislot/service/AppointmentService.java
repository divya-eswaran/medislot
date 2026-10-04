package com.medislot.medislot.service;

import com.medislot.medislot.dto.AppointmentDto;
import com.medislot.medislot.dto.BookAppointmentRequest;
import com.medislot.medislot.dto.RescheduleRequest;
import com.medislot.medislot.dto.SlotDto;
import com.medislot.medislot.entity.*;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ConflictException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.exception.UnauthorizedException;
import com.medislot.medislot.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            ConsultationRepository consultationRepository,
            PrescriptionRepository prescriptionRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    /**
     * CORE SCHEDULING ENGINE:
     * Generates slots dynamically based on doctor's schedule, breaks, working days, leaves,
     * capacity, and already booked appointments.
     */
    @Transactional(readOnly = true)
    public List<SlotDto> generateSlotsForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (!doctor.isBookable()) {
            throw new BadRequestException("Doctor is not available for appointments");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot check slots for a past date");
        }

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            return Collections.emptyList();
        }

        // 1. Check if doctor works on this day of week
        if (!availability.isWorkingDay(date.getDayOfWeek())) {
            return Collections.emptyList();
        }

        // 2. Check if doctor marked this specific date as unavailable/leave
        boolean isUnavailableDate = availability.getUnavailableDates() != null &&
                availability.getUnavailableDates().stream().anyMatch(u -> u.getDate().equals(date));
        if (isUnavailableDate) {
            return Collections.emptyList();
        }

        // 3. Check capacity limit for today
        long currentBookedCount = appointmentRepository.countActiveAppointmentsByDoctorAndDate(doctorId, date);
        boolean isDayFullyBooked = currentBookedCount >= availability.getMaxPatientsPerDay();

        List<SlotDto> slots = new ArrayList<>();
        LocalTime currentSlotStart = availability.getStartTime();
        LocalTime dayEndTime = availability.getEndTime();
        int durationMinutes = Math.max(availability.getSlotDurationMinutes(), 10);

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        int tokenCounter = appointmentRepository.findMaxTokenNumber(doctorId, date);

        while (currentSlotStart.plusMinutes(durationMinutes).compareTo(dayEndTime) <= 0) {
            LocalTime slotEnd = currentSlotStart.plusMinutes(durationMinutes);

            // Check break overlap
            boolean isBreak = false;
            String breakTitle = null;
            if (availability.getBreaks() != null) {
                for (DoctorBreak b : availability.getBreaks()) {
                    if (currentSlotStart.isBefore(b.getEndTime()) && slotEnd.isAfter(b.getStartTime())) {
                        isBreak = true;
                        breakTitle = b.getTitle();
                        break;
                    }
                }
            }

            // Check if already booked
            boolean isBooked = appointmentRepository.isSlotBooked(doctorId, date, currentSlotStart);

            // Check if in past
            boolean isPast = date.equals(today) && currentSlotStart.isBefore(now);

            // Available condition
            boolean isAvailable = !isBreak && !isBooked && !isPast && !isDayFullyBooked;

            int estimatedToken = isAvailable ? (++tokenCounter) : 0;

            slots.add(new SlotDto(
                    currentSlotStart,
                    slotEnd,
                    isAvailable,
                    isBooked,
                    isBreak,
                    breakTitle,
                    isPast,
                    estimatedToken
            ));

            currentSlotStart = slotEnd;
        }

        return slots;
    }

    /**
     * BOOK APPOINTMENT:
     * Validates availability, working hours, capacity, prevents double booking,
     * assigns unique token per doctor/date, and stores appointment.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized AppointmentDto bookAppointment(String userEmail, BookAppointmentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.isBookable()) {
            throw new BadRequestException("Doctor is currently inactive or not approved for bookings");
        }

        LocalDate date = request.getAppointmentDate();
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment for a past date");
        }

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            throw new BadRequestException("Doctor has not configured availability schedule");
        }

        // Verify working day
        if (!availability.isWorkingDay(date.getDayOfWeek())) {
            throw new BadRequestException("Doctor does not work on " + date.getDayOfWeek());
        }

        // Verify leave
        boolean onLeave = availability.getUnavailableDates() != null &&
                availability.getUnavailableDates().stream().anyMatch(u -> u.getDate().equals(date));
        if (onLeave) {
            throw new BadRequestException("Doctor is on leave on " + date);
        }

        LocalTime startTime = request.getStartTime();
        int duration = availability.getSlotDurationMinutes();
        LocalTime endTime = startTime.plusMinutes(duration);

        // Verify working hours
        if (startTime.isBefore(availability.getStartTime()) || endTime.isAfter(availability.getEndTime())) {
            throw new BadRequestException("Selected time is outside doctor's working hours (" +
                    availability.getStartTime() + " - " + availability.getEndTime() + ")");
        }

        // Verify past time today
        if (date.equals(LocalDate.now()) && startTime.isBefore(LocalTime.now())) {
            throw new BadRequestException("Cannot book a time slot in the past");
        }

        // Verify break overlap
        if (availability.getBreaks() != null) {
            for (DoctorBreak b : availability.getBreaks()) {
                if (startTime.isBefore(b.getEndTime()) && endTime.isAfter(b.getStartTime())) {
                    throw new BadRequestException("Selected time overlaps with doctor's " + b.getTitle() + " (" +
                            b.getStartTime() + " - " + b.getEndTime() + ")");
                }
            }
        }

        // Verify daily capacity
        long bookedCount = appointmentRepository.countActiveAppointmentsByDoctorAndDate(doctor.getId(), date);
        if (bookedCount >= availability.getMaxPatientsPerDay()) {
            throw new BadRequestException("Doctor has reached maximum patient capacity (" +
                    availability.getMaxPatientsPerDay() + ") for " + date + ". Fully Booked.");
        }

        // CRITICAL: Double booking check
        if (appointmentRepository.isSlotBooked(doctor.getId(), date, startTime)) {
            throw new ConflictException("Sorry, this time slot was just booked by another patient. Please select another slot.");
        }

        // Sequential token assignment specific to Doctor + Date
        int nextToken = appointmentRepository.findMaxTokenNumber(doctor.getId(), date) + 1;

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(date);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setTokenNumber(nextToken);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setReason(request.getReason());

        appointment = appointmentRepository.save(appointment);

        // Send notifications
        notificationService.createNotification(
                patient.getUser(),
                "Appointment Confirmed",
                "Your appointment with Dr. " + doctor.getFullName() + " on " + date + " at " + startTime + " is confirmed. Token #" + nextToken,
                "APPOINTMENT"
        );

        notificationService.createNotification(
                doctor.getUser(),
                "New Appointment Booked",
                "Patient " + patient.getFullName() + " booked Token #" + nextToken + " on " + date + " at " + startTime,
                "APPOINTMENT"
        );

        return mapToDto(appointment);
    }

    /**
     * RESCHEDULE APPOINTMENT:
     * Moves appointment to a new date/time slot, validating slot availability,
     * capacity, and re-calculating token number for new date.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized AppointmentDto rescheduleAppointment(Long appointmentId, String userEmail, RescheduleRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(user.getId());
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to reschedule this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
            appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule a " + appointment.getStatus() + " appointment");
        }

        LocalDate newDate = request.getNewAppointmentDate();
        LocalTime newStartTime = request.getNewStartTime();

        if (newDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot reschedule to a past date");
        }

        Doctor doctor = appointment.getDoctor();
        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            throw new BadRequestException("Doctor has not configured availability schedule");
        }

        if (!availability.isWorkingDay(newDate.getDayOfWeek())) {
            throw new BadRequestException("Doctor does not work on " + newDate.getDayOfWeek());
        }

        boolean onLeave = availability.getUnavailableDates() != null &&
                availability.getUnavailableDates().stream().anyMatch(u -> u.getDate().equals(newDate));
        if (onLeave) {
            throw new BadRequestException("Doctor is on leave on " + newDate);
        }

        int duration = availability.getSlotDurationMinutes();
        LocalTime newEndTime = newStartTime.plusMinutes(duration);

        if (newStartTime.isBefore(availability.getStartTime()) || newEndTime.isAfter(availability.getEndTime())) {
            throw new BadRequestException("Selected time is outside doctor's working hours");
        }

        if (newDate.equals(LocalDate.now()) && newStartTime.isBefore(LocalTime.now())) {
            throw new BadRequestException("Cannot reschedule to a time in the past");
        }

        if (availability.getBreaks() != null) {
            for (DoctorBreak b : availability.getBreaks()) {
                if (newStartTime.isBefore(b.getEndTime()) && newEndTime.isAfter(b.getStartTime())) {
                    throw new BadRequestException("Selected time overlaps with doctor's " + b.getTitle());
                }
            }
        }

        // Check if day is full (if date is changing)
        if (!newDate.equals(appointment.getAppointmentDate())) {
            long bookedCount = appointmentRepository.countActiveAppointmentsByDoctorAndDate(doctor.getId(), newDate);
            if (bookedCount >= availability.getMaxPatientsPerDay()) {
                throw new BadRequestException("Doctor has reached maximum patient capacity for " + newDate);
            }
        }

        // Conflict check excluding current appointment
        if (appointmentRepository.isSlotBookedExcluding(doctor.getId(), newDate, newStartTime, appointment.getId())) {
            throw new ConflictException("Sorry, this time slot was just booked by another patient. Please select another slot.");
        }

        int newToken = appointment.getTokenNumber();
        if (!newDate.equals(appointment.getAppointmentDate())) {
            newToken = appointmentRepository.findMaxTokenNumber(doctor.getId(), newDate) + 1;
        }

        appointment.setAppointmentDate(newDate);
        appointment.setStartTime(newStartTime);
        appointment.setEndTime(newEndTime);
        appointment.setTokenNumber(newToken);
        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }

        appointment = appointmentRepository.save(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Rescheduled",
                "Your appointment with Dr. " + doctor.getFullName() + " was rescheduled to " + newDate + " at " + newStartTime + ". Token #" + newToken,
                "APPOINTMENT"
        );

        notificationService.createNotification(
                doctor.getUser(),
                "Appointment Rescheduled",
                "Appointment for " + appointment.getPatient().getFullName() + " rescheduled to " + newDate + " at " + newStartTime,
                "APPOINTMENT"
        );

        return mapToDto(appointment);
    }

    /**
     * CANCEL APPOINTMENT:
     * Marks appointment as CANCELLED, freeing the slot for other patients.
     */
    @Transactional
    public AppointmentDto cancelAppointment(Long appointmentId, String userEmail, String cancelReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(user.getId());
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(cancelReason != null ? cancelReason : "Cancelled by user");
        appointment = appointmentRepository.save(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Cancelled",
                "Your appointment with Dr. " + appointment.getDoctor().getFullName() + " on " +
                        appointment.getAppointmentDate() + " has been cancelled.",
                "CANCELLATION"
        );

        notificationService.createNotification(
                appointment.getDoctor().getUser(),
                "Appointment Cancelled",
                "Appointment for " + appointment.getPatient().getFullName() + " on " +
                        appointment.getAppointmentDate() + " (Token #" + appointment.getTokenNumber() + ") was cancelled.",
                "CANCELLATION"
        );

        return mapToDto(appointment);
    }

    public List<AppointmentDto> getAppointmentsForPatient(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsForDoctor(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctor.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getTodayAppointmentsForDoctor(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return appointmentRepository.findTodayAppointmentsForDoctor(doctor.getId(), LocalDate.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAllAppointmentsForAdmin() {
        return appointmentRepository.findAll().stream()
                .sorted(Comparator.comparing(Appointment::getAppointmentDate).reversed()
                        .thenComparing(Appointment::getStartTime).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToDto(appointment);
    }

    public AppointmentDto mapToDto(Appointment a) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(a.getId());

        if (a.getDoctor() != null) {
            dto.setDoctorId(a.getDoctor().getId());
            dto.setDoctorName(a.getDoctor().getFullName());
            if (a.getDoctor().getSpecialization() != null) {
                dto.setDoctorSpecialization(a.getDoctor().getSpecialization().getName());
            }
            dto.setProfileImage(a.getDoctor().getProfileImage());
            dto.setConsultationFee(a.getDoctor().getConsultationFee());
        }

        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getFullName());
            dto.setPatientPhone(a.getPatient().getPhone());
            if (a.getPatient().getUser() != null) {
                dto.setPatientEmail(a.getPatient().getUser().getEmail());
            }
        }

        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        dto.setTokenNumber(a.getTokenNumber());
        dto.setStatus(a.getStatus());
        dto.setReason(a.getReason());
        dto.setCancelReason(a.getCancelReason());
        dto.setCreatedAt(a.getCreatedAt());

        dto.setHasConsultation(consultationRepository.findByAppointmentId(a.getId()).isPresent());
        dto.setHasPrescription(prescriptionRepository.findByAppointmentId(a.getId()).isPresent());

        return dto;
    }
}
