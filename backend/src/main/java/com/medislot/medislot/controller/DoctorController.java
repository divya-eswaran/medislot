package com.medislot.medislot.controller;

import com.medislot.medislot.dto.*;
import com.medislot.medislot.security.SecurityUtil;
import com.medislot.medislot.service.AppointmentService;
import com.medislot.medislot.service.AvailabilityService;
import com.medislot.medislot.service.ConsultationService;
import com.medislot.medislot.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;
    private final AvailabilityService availabilityService;
    private final AppointmentService appointmentService;
    private final ConsultationService consultationService;

    public DoctorController(
            DoctorService doctorService,
            AvailabilityService availabilityService,
            AppointmentService appointmentService,
            ConsultationService consultationService) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
        this.appointmentService = appointmentService;
        this.consultationService = consultationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorDto>> getProfile() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", doctorService.getDoctorByEmail(email)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorDto>> updateProfile(@RequestBody DoctorUpdateRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        DoctorDto updated = doctorService.updateDoctorProfile(current.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<AvailabilityDto>> getAvailability() {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved", availabilityService.getDoctorAvailability(current.getId())));
    }

    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<AvailabilityDto>> updateAvailability(@RequestBody AvailabilityDto dto) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Schedule updated successfully", availabilityService.updateAvailability(current.getId(), dto)));
    }

    @PostMapping("/breaks")
    public ResponseEntity<ApiResponse<BreakDto>> addBreak(@Valid @RequestBody BreakDto dto) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Break added successfully", availabilityService.addBreak(current.getId(), dto)));
    }

    @DeleteMapping("/breaks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBreak(@PathVariable Long id) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        availabilityService.deleteBreak(current.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Break deleted successfully"));
    }

    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<UnavailableDateDto>> addLeave(@Valid @RequestBody UnavailableDateDto dto) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Leave date added", availabilityService.addUnavailableDate(current.getId(), dto)));
    }

    @DeleteMapping("/leaves/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLeave(@PathVariable Long id) {
        String email = SecurityUtil.getCurrentUserEmail();
        DoctorDto current = doctorService.getDoctorByEmail(email);
        availabilityService.deleteUnavailableDate(current.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Leave date removed"));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointmentService.getAppointmentsForDoctor(email)));
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getTodayAppointments() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Today's schedule retrieved", appointmentService.getTodayAppointmentsForDoctor(email)));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String email = SecurityUtil.getCurrentUserEmail();
        String reason = body != null ? body.get("reason") : "Cancelled by doctor";
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointmentService.cancelAppointment(id, email, reason)));
    }

    @PostMapping("/appointments/{id}/consultation")
    public ResponseEntity<ApiResponse<AppointmentDto>> completeConsultation(
            @PathVariable Long id,
            @RequestBody ConsultationRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        AppointmentDto result = consultationService.completeConsultation(id, email, request);
        return ResponseEntity.ok(ApiResponse.success("Consultation completed and prescription saved successfully", result));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getPrescriptions() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved", consultationService.getPrescriptionsForDoctor(email)));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<List<MedicalRecordDto>>> getMedicalRecords() {
        String email = SecurityUtil.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success("Medical records retrieved", consultationService.getMedicalRecordsForDoctor(email)));
    }
}
