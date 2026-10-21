package com.medislot.medislot.service;

import com.medislot.medislot.dto.AdminStatsDto;
import com.medislot.medislot.entity.Appointment;
import com.medislot.medislot.entity.AppointmentStatus;
import com.medislot.medislot.entity.DoctorStatus;
import com.medislot.medislot.entity.Role;
import com.medislot.medislot.repository.AppointmentRepository;
import com.medislot.medislot.repository.DoctorRepository;
import com.medislot.medislot.repository.PatientRepository;
import com.medislot.medislot.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AppointmentService appointmentService;

    public AdminService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            AppointmentService appointmentService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.appointmentService = appointmentService;
    }

    public AdminStatsDto getDashboardStats() {
        appointmentService.autoUpdatePastAppointments();
        AdminStatsDto stats = new AdminStatsDto();

        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDoctors(doctorRepository.count());
        stats.setActiveDoctors(doctorRepository.countByActiveTrueAndStatus(DoctorStatus.APPROVED));
        stats.setPendingDoctorAccounts(doctorRepository.countByStatus(DoctorStatus.PENDING));

        stats.setTotalAppointments(appointmentRepository.count());
        stats.setTodayAppointments(appointmentRepository.countByAppointmentDate(LocalDate.now()));
        stats.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));

        List<Appointment> allAppointments = appointmentRepository.findAll();

        Map<String, Long> byStatus = new HashMap<>();
        Map<String, Long> bySpec = new HashMap<>();

        for (Appointment a : allAppointments) {
            String status = a.getStatus().name();
            byStatus.put(status, byStatus.getOrDefault(status, 0L) + 1);

            if (a.getDoctor() != null && a.getDoctor().getSpecialization() != null) {
                String spec = a.getDoctor().getSpecialization().getName();
                bySpec.put(spec, bySpec.getOrDefault(spec, 0L) + 1);
            }
        }

        stats.setAppointmentsByStatus(byStatus);
        stats.setAppointmentsBySpecialization(bySpec);

        return stats;
    }
}
