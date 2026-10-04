package com.medislot.medislot.controller;

import com.medislot.medislot.dto.ApiResponse;
import com.medislot.medislot.dto.SpecializationDto;
import com.medislot.medislot.service.SpecializationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specializations")
public class SpecializationController {

    private final SpecializationService specializationService;

    public SpecializationController(SpecializationService specializationService) {
        this.specializationService = specializationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpecializationDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Specializations retrieved", specializationService.getAllSpecializations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecializationDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Specialization retrieved", specializationService.getSpecializationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SpecializationDto>> create(@Valid @RequestBody SpecializationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Specialization created", specializationService.createSpecialization(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SpecializationDto>> update(@PathVariable Long id, @Valid @RequestBody SpecializationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Specialization updated", specializationService.updateSpecialization(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        specializationService.deleteSpecialization(id);
        return ResponseEntity.ok(ApiResponse.success("Specialization deleted"));
    }
}
