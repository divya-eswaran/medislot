package com.medislot.medislot.controller;

import com.medislot.medislot.dto.*;
import com.medislot.medislot.security.SecurityUtil;
import com.medislot.medislot.service.AppointmentService;
import com.medislot.medislot.service.ConsultationService;
import com.medislot.medislot.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final ConsultationService consultationService;

    public PatientController(
            PatientService patientService,
            AppointmentService appointmentService,
            ConsultationService consultationService) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
        this.consultationService = consultationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<PatientDto>> getProfile() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", patientService.getPatientByEmail(email)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<PatientDto>> updateProfile(@RequestBody PatientDto dto) {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", patientService.updateProfile(email, dto)));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        AppointmentDto appointment = appointmentService.bookAppointment(email, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully! Token #" + appointment.getTokenNumber(), appointment));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointmentService.getAppointmentsForPatient(email)));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String email = SecurityUtil.getCurrentUserEmail();
        String reason = body != null ? body.get("reason") : "Cancelled by patient";
        AppointmentDto appointment = appointmentService.cancelAppointment(id, email, reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", appointment));
    }

    @PutMapping("/appointments/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDto>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        AppointmentDto appointment = appointmentService.rescheduleAppointment(id, email, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully! New Token #" + appointment.getTokenNumber(), appointment));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getPrescriptions() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved", consultationService.getPrescriptionsForPatient(email)));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<List<MedicalRecordDto>>> getMedicalRecords() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Medical records retrieved", consultationService.getMedicalRecordsForPatient(email)));
    }
}
