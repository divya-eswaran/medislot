package com.medislot.medislot.service;

import com.medislot.medislot.dto.AuthRequest;
import com.medislot.medislot.dto.AuthResponse;
import com.medislot.medislot.dto.ChangePasswordRequest;
import com.medislot.medislot.dto.RegisterRequest;
import com.medislot.medislot.entity.*;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.DoctorRepository;
import com.medislot.medislot.repository.PatientRepository;
import com.medislot.medislot.repository.UserRepository;
import com.medislot.medislot.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            NotificationService notificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse registerPatient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);
        user.setActive(true);
        user.setMustChangePassword(false);
        user = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFullName(request.getFullName().trim());
        patient.setPhone(request.getPhone().trim());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient = patientRepository.save(patient);

        notificationService.createNotification(
                user,
                "Welcome to MediSlot!",
                "Your patient account has been created successfully. You can now discover doctors and schedule appointments.",
                "SYSTEM"
        );

        String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                patient.getFullName(),
                user.getRole(),
                patient.getId(),
                false
        );
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact support or the administrator.");
        }

        String token = tokenProvider.generateToken(authentication);

        String fullName = user.getEmail();
        Long profileId = null;

        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient != null) {
                fullName = patient.getFullName();
                profileId = patient.getId();
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);
            if (doctor != null) {
                fullName = doctor.getFullName();
                profileId = doctor.getId();
            }
        } else if (user.getRole() == Role.ADMIN) {
            fullName = "MediSlot Administrator";
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                fullName,
                user.getRole(),
                profileId,
                user.isMustChangePassword()
        );
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        notificationService.createNotification(
                user,
                "Password Changed",
                "Your account password was updated successfully.",
                "SYSTEM"
        );
    }
}
