package com.medislot.medislot.controller;

import com.medislot.medislot.dto.*;
import com.medislot.medislot.security.SecurityUtil;
import com.medislot.medislot.service.AdminService;
import com.medislot.medislot.service.AppointmentService;
import com.medislot.medislot.service.DoctorService;
import com.medislot.medislot.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    public AdminController(
            AdminService adminService,
            DoctorService doctorService,
            PatientService patientService,
            AppointmentService appointmentService) {
        this.adminService = adminService;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", adminService.getDashboardStats()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", doctorService.getAllDoctorsForAdmin()));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        DoctorDto doctor = doctorService.createDoctorByAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Doctor account created successfully", doctor));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctor(
            @PathVariable Long id,
            @RequestBody DoctorUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.updateDoctorProfile(id, request)));
    }

    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<ApiResponse<DoctorDto>> approveDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor approved successfully", doctorService.approveDoctor(id)));
    }

    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<ApiResponse<DoctorDto>> rejectDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor rejected", doctorService.rejectDoctor(id)));
    }

    @PutMapping("/doctors/{id}/activate")
    public ResponseEntity<ApiResponse<DoctorDto>> activateDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor activated", doctorService.setDoctorActiveStatus(id, true)));
    }

    @PutMapping("/doctors/{id}/deactivate")
    public ResponseEntity<ApiResponse<DoctorDto>> deactivateDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor deactivated", doctorService.setDoctorActiveStatus(id, false)));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<PatientDto>>> getPatients(
            @RequestParam(required = false) String search) {
        List<PatientDto> patients = patientService.searchPatients(search);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved", patients));
    }

    @PutMapping("/patients/{id}/activate")
    public ResponseEntity<ApiResponse<PatientDto>> activatePatient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Patient activated", patientService.setPatientActiveStatus(id, true)));
    }

    @PutMapping("/patients/{id}/deactivate")
    public ResponseEntity<ApiResponse<PatientDto>> deactivatePatient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Patient deactivated", patientService.setPatientActiveStatus(id, false)));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointmentService.getAllAppointmentsForAdmin()));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String email = SecurityUtil.getCurrentUserEmail();
        String reason = body != null ? body.get("reason") : "Cancelled by administrator";
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointmentService.cancelAppointment(id, email, reason)));
    }
}
