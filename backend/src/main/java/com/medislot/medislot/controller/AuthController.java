package com.medislot.medislot.controller;

import com.medislot.medislot.dto.*;
import com.medislot.medislot.security.SecurityUtil;
import com.medislot.medislot.service.AuthService;
import com.medislot.medislot.service.DoctorService;
import com.medislot.medislot.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public AuthController(AuthService authService, PatientService patientService, DoctorService doctorService) {
        this.authService = authService;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
