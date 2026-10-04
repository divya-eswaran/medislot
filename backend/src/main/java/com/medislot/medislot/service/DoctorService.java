package com.medislot.medislot.service;

import com.medislot.medislot.dto.DoctorCreateRequest;
import com.medislot.medislot.dto.DoctorDto;
import com.medislot.medislot.dto.DoctorUpdateRequest;
import com.medislot.medislot.entity.*;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.DoctorRepository;
import com.medislot.medislot.repository.SpecializationRepository;
import com.medislot.medislot.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final AvailabilityService availabilityService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            SpecializationRepository specializationRepository,
            AvailabilityService availabilityService,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.specializationRepository = specializationRepository;
        this.availabilityService = availabilityService;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<DoctorDto> getAllApprovedDoctors() {
        return doctorRepository.findByStatusAndActiveTrue(DoctorStatus.APPROVED)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DoctorDto> getDoctorsBySpecialization(Long specializationId) {
        return doctorRepository.findBySpecializationIdAndStatusAndActiveTrue(specializationId, DoctorStatus.APPROVED)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DoctorDto> searchDoctors(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllApprovedDoctors();
        }
        return doctorRepository.searchApprovedActiveDoctors(query.trim())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapToDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user id: " + userId));
        return mapToDto(doctor);
    }

    public DoctorDto getDoctorByEmail(String email) {
        Doctor doctor = doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for email: " + email));
        return mapToDto(doctor);
    }

    public List<DoctorDto> getAllDoctorsForAdmin() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDto createDoctorByAdmin(DoctorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        Specialization spec = specializationRepository.findById(request.getSpecializationId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));

        String rawPassword = request.getTemporaryPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "Doc@" + UUID.randomUUID().toString().substring(0, 6);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.DOCTOR);
        user.setActive(true);
        user.setMustChangePassword(true);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFullName(request.getFullName());
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(spec);
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0);
        doctor.setConsultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 0.0);
        doctor.setBio(request.getBio());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setProfileImage(request.getProfileImage());
        doctor.setStatus(request.isAutoApprove() ? DoctorStatus.APPROVED : DoctorStatus.PENDING);
        doctor.setActive(true);

        doctor = doctorRepository.save(doctor);

        // Initialize default availability
        availabilityService.createDefaultAvailability(doctor);

        notificationService.createNotification(
                user,
                "Welcome to MediSlot",
                "Your doctor account has been created. Please log in and update your temporary password.",
                "SYSTEM"
        );

        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto updateDoctorProfile(Long doctorId, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (request.getFullName() != null) doctor.setFullName(request.getFullName());
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getClinicAddress() != null) doctor.setClinicAddress(request.getClinicAddress());
        if (request.getProfileImage() != null) doctor.setProfileImage(request.getProfileImage());

        if (request.getSpecializationId() != null) {
            Specialization spec = specializationRepository.findById(request.getSpecializationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
            doctor.setSpecialization(spec);
        }

        doctor = doctorRepository.save(doctor);
        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        doctor.setStatus(DoctorStatus.APPROVED);
        doctor.setActive(true);
        doctor = doctorRepository.save(doctor);

        notificationService.createNotification(
                doctor.getUser(),
                "Account Approved",
                "Congratulations! Your doctor account has been approved by the Admin. You are now active for bookings.",
                "SYSTEM"
        );

        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        doctor.setStatus(DoctorStatus.REJECTED);
        doctor = doctorRepository.save(doctor);

        notificationService.createNotification(
                doctor.getUser(),
                "Account Status Update",
                "Your doctor application has been rejected by the administrator.",
                "SYSTEM"
        );

        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto setDoctorActiveStatus(Long doctorId, boolean active) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        doctor.setActive(active);
        if (doctor.getUser() != null) {
            doctor.getUser().setActive(active);
            userRepository.save(doctor.getUser());
        }
        doctor = doctorRepository.save(doctor);

        notificationService.createNotification(
                doctor.getUser(),
                "Account Status Update",
                active ? "Your doctor profile is now active." : "Your doctor profile has been deactivated by the administrator.",
                "SYSTEM"
        );

        return mapToDto(doctor);
    }

    public DoctorDto mapToDto(Doctor d) {
        DoctorDto dto = new DoctorDto();
        dto.setId(d.getId());
        if (d.getUser() != null) {
            dto.setUserId(d.getUser().getId());
            dto.setEmail(d.getUser().getEmail());
        }
        dto.setFullName(d.getFullName());
        dto.setPhone(d.getPhone());
        if (d.getSpecialization() != null) {
            dto.setSpecializationId(d.getSpecialization().getId());
            dto.setSpecializationName(d.getSpecialization().getName());
        }
        dto.setQualification(d.getQualification());
        dto.setExperienceYears(d.getExperienceYears());
        dto.setConsultationFee(d.getConsultationFee());
        dto.setBio(d.getBio());
        dto.setClinicAddress(d.getClinicAddress());
        dto.setProfileImage(d.getProfileImage());
        dto.setStatus(d.getStatus());
        dto.setActive(d.isActive());

        if (d.getAvailability() != null) {
            dto.setAvailability(availabilityService.mapToDto(d.getAvailability()));
        }

        return dto;
    }
}
