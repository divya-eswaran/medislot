package com.medislot.medislot.controller;

import com.medislot.medislot.dto.ApiResponse;
import com.medislot.medislot.dto.AvailabilityDto;
import com.medislot.medislot.dto.DoctorDto;
import com.medislot.medislot.dto.SlotDto;
import com.medislot.medislot.service.AppointmentService;
import com.medislot.medislot.service.AvailabilityService;
import com.medislot.medislot.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class PublicDoctorController {

    private final DoctorService doctorService;
    private final AvailabilityService availabilityService;
    private final AppointmentService appointmentService;

    public PublicDoctorController(
            DoctorService doctorService,
            AvailabilityService availabilityService,
            AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getDoctors(
            @RequestParam(required = false) Long specializationId,
            @RequestParam(required = false) String search) {
        List<DoctorDto> doctors;
        if (specializationId != null) {
            doctors = doctorService.getDoctorsBySpecialization(specializationId);
        } else if (search != null && !search.trim().isEmpty()) {
            doctors = doctorService.searchDoctors(search);
        } else {
            doctors = doctorService.getAllApprovedDoctors();
        }
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable Long id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved", doctor));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<AvailabilityDto>> getDoctorAvailability(@PathVariable Long id) {
        AvailabilityDto availability = availabilityService.getDoctorAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor availability retrieved", availability));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<SlotDto>>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotDto> slots = appointmentService.generateSlotsForDoctor(id, date);
        return ResponseEntity.ok(ApiResponse.success("Slots generated", slots));
    }
}
