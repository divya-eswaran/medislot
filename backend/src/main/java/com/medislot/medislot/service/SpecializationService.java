package com.medislot.medislot.service;

import com.medislot.medislot.dto.SpecializationDto;
import com.medislot.medislot.entity.DoctorStatus;
import com.medislot.medislot.entity.Specialization;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.DoctorRepository;
import com.medislot.medislot.repository.SpecializationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecializationService {

    private final SpecializationRepository specializationRepository;
    private final DoctorRepository doctorRepository;

    public SpecializationService(SpecializationRepository specializationRepository, DoctorRepository doctorRepository) {
        this.specializationRepository = specializationRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<SpecializationDto> getAllSpecializations() {
        return specializationRepository.findAll().stream().map(s -> {
            long count = doctorRepository.findBySpecializationIdAndStatusAndActiveTrue(s.getId(), DoctorStatus.APPROVED).size();
            return new SpecializationDto(s.getId(), s.getName(), s.getDescription(), s.getIcon(), count);
        }).collect(Collectors.toList());
    }

    public SpecializationDto getSpecializationById(Long id) {
        Specialization s = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + id));
        long count = doctorRepository.findBySpecializationIdAndStatusAndActiveTrue(s.getId(), DoctorStatus.APPROVED).size();
        return new SpecializationDto(s.getId(), s.getName(), s.getDescription(), s.getIcon(), count);
    }

    @Transactional
    public SpecializationDto createSpecialization(SpecializationDto dto) {
        if (specializationRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Specialization already exists: " + dto.getName());
        }

        Specialization s = new Specialization(dto.getName(), dto.getDescription(), dto.getIcon());
        s = specializationRepository.save(s);
        return new SpecializationDto(s.getId(), s.getName(), s.getDescription(), s.getIcon(), 0);
    }

    @Transactional
    public SpecializationDto updateSpecialization(Long id, SpecializationDto dto) {
        Specialization s = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + id));

        s.setName(dto.getName());
        s.setDescription(dto.getDescription());
        s.setIcon(dto.getIcon());
        s = specializationRepository.save(s);

        long count = doctorRepository.findBySpecializationIdAndStatusAndActiveTrue(s.getId(), DoctorStatus.APPROVED).size();
        return new SpecializationDto(s.getId(), s.getName(), s.getDescription(), s.getIcon(), count);
    }

    @Transactional
    public void deleteSpecialization(Long id) {
        Specialization s = specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + id));

        long count = doctorRepository.findBySpecializationIdAndStatusAndActiveTrue(s.getId(), DoctorStatus.APPROVED).size();
        if (count > 0) {
            throw new BadRequestException("Cannot delete specialization that is assigned to active doctors");
        }
        specializationRepository.delete(s);
    }
}
