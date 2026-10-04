package com.medislot.medislot.service;

import com.medislot.medislot.dto.PatientDto;
import com.medislot.medislot.entity.Patient;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.PatientRepository;
import com.medislot.medislot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDto(patient);
    }

    public PatientDto getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + userId));
        return mapToDto(patient);
    }

    public PatientDto getPatientByEmail(String email) {
        Patient patient = patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));
        return mapToDto(patient);
    }

    public List<PatientDto> getAllPatientsForAdmin() {
        return patientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PatientDto> searchPatients(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllPatientsForAdmin();
        }
        return patientRepository.searchPatients(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDto updateProfile(String email, PatientDto dto) {
        Patient patient = patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for email: " + email));

        if (dto.getFullName() != null) patient.setFullName(dto.getFullName());
        if (dto.getPhone() != null) patient.setPhone(dto.getPhone());
        if (dto.getDateOfBirth() != null) patient.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getBloodGroup() != null) patient.setBloodGroup(dto.getBloodGroup());
        if (dto.getAddress() != null) patient.setAddress(dto.getAddress());
        if (dto.getEmergencyContact() != null) patient.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getProfilePhoto() != null) patient.setProfilePhoto(dto.getProfilePhoto());

        patient = patientRepository.save(patient);
        return mapToDto(patient);
    }

    @Transactional
    public PatientDto setPatientActiveStatus(Long patientId, boolean active) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (patient.getUser() != null) {
            patient.getUser().setActive(active);
            userRepository.save(patient.getUser());
        }

        return mapToDto(patient);
    }

    public PatientDto mapToDto(Patient p) {
        PatientDto dto = new PatientDto();
        dto.setId(p.getId());
        if (p.getUser() != null) {
            dto.setUserId(p.getUser().getId());
            dto.setEmail(p.getUser().getEmail());
            dto.setActive(p.getUser().isActive());
        }
        dto.setFullName(p.getFullName());
        dto.setPhone(p.getPhone());
        dto.setDateOfBirth(p.getDateOfBirth());
        dto.setGender(p.getGender());
        dto.setBloodGroup(p.getBloodGroup());
        dto.setAddress(p.getAddress());
        dto.setEmergencyContact(p.getEmergencyContact());
        dto.setProfilePhoto(p.getProfilePhoto());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
