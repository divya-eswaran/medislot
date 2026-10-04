package com.medislot.medislot.service;

import com.medislot.medislot.dto.AvailabilityDto;
import com.medislot.medislot.dto.BreakDto;
import com.medislot.medislot.dto.UnavailableDateDto;
import com.medislot.medislot.entity.Doctor;
import com.medislot.medislot.entity.DoctorAvailability;
import com.medislot.medislot.entity.DoctorBreak;
import com.medislot.medislot.entity.DoctorUnavailableDate;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.repository.DoctorAvailabilityRepository;
import com.medislot.medislot.repository.DoctorBreakRepository;
import com.medislot.medislot.repository.DoctorRepository;
import com.medislot.medislot.repository.DoctorUnavailableDateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorBreakRepository breakRepository;
    private final DoctorUnavailableDateRepository unavailableDateRepository;

    public AvailabilityService(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository,
            DoctorBreakRepository breakRepository,
            DoctorUnavailableDateRepository unavailableDateRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.breakRepository = breakRepository;
        this.unavailableDateRepository = unavailableDateRepository;
    }

    public AvailabilityDto getDoctorAvailability(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            availability = createDefaultAvailability(doctor);
        }

        return mapToDto(availability);
    }

    @Transactional
    public DoctorAvailability createDefaultAvailability(Doctor doctor) {
        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setStartTime(java.time.LocalTime.of(9, 0));
        availability.setEndTime(java.time.LocalTime.of(17, 0));
        availability.setSlotDurationMinutes(20);
        availability.setMaxPatientsPerDay(20);
        availability.setMondayActive(true);
        availability.setTuesdayActive(true);
        availability.setWednesdayActive(true);
        availability.setThursdayActive(true);
        availability.setFridayActive(true);
        availability.setSaturdayActive(false);
        availability.setSundayActive(false);

        // Add standard lunch break 13:00 - 14:00
        DoctorBreak lunch = new DoctorBreak("Lunch Break", java.time.LocalTime.of(13, 0), java.time.LocalTime.of(14, 0));
        availability.addBreak(lunch);

        doctor.setAvailability(availability);
        return availabilityRepository.save(availability);
    }

    @Transactional
    public AvailabilityDto updateAvailability(Long doctorId, AvailabilityDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            availability = new DoctorAvailability();
            availability.setDoctor(doctor);
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            if (!dto.getStartTime().isBefore(dto.getEndTime())) {
                throw new BadRequestException("Start time must be before end time");
            }
            availability.setStartTime(dto.getStartTime());
            availability.setEndTime(dto.getEndTime());
        }

        if (dto.getSlotDurationMinutes() > 0) {
            availability.setSlotDurationMinutes(dto.getSlotDurationMinutes());
        }

        if (dto.getMaxPatientsPerDay() > 0) {
            availability.setMaxPatientsPerDay(dto.getMaxPatientsPerDay());
        }

        availability.setMondayActive(dto.isMondayActive());
        availability.setTuesdayActive(dto.isTuesdayActive());
        availability.setWednesdayActive(dto.isWednesdayActive());
        availability.setThursdayActive(dto.isThursdayActive());
        availability.setFridayActive(dto.isFridayActive());
        availability.setSaturdayActive(dto.isSaturdayActive());
        availability.setSundayActive(dto.isSundayActive());

        availability = availabilityRepository.save(availability);
        return mapToDto(availability);
    }

    @Transactional
    public BreakDto addBreak(Long doctorId, BreakDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            availability = createDefaultAvailability(doctor);
        }

        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BadRequestException("Break start time must be before end time");
        }

        DoctorBreak b = new DoctorBreak(dto.getTitle(), dto.getStartTime(), dto.getEndTime());
        availability.addBreak(b);
        b = breakRepository.save(b);

        return new BreakDto(b.getId(), b.getTitle(), b.getStartTime(), b.getEndTime());
    }

    @Transactional
    public void deleteBreak(Long doctorId, Long breakId) {
        DoctorBreak b = breakRepository.findById(breakId)
                .orElseThrow(() -> new ResourceNotFoundException("Break not found with id: " + breakId));

        if (!b.getAvailability().getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("Break does not belong to this doctor");
        }

        b.getAvailability().removeBreak(b);
        breakRepository.delete(b);
    }

    @Transactional
    public UnavailableDateDto addUnavailableDate(Long doctorId, UnavailableDateDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        DoctorAvailability availability = doctor.getAvailability();
        if (availability == null) {
            availability = createDefaultAvailability(doctor);
        }

        if (unavailableDateRepository.existsByAvailabilityIdAndDate(availability.getId(), dto.getDate())) {
            throw new BadRequestException("Date is already marked as unavailable: " + dto.getDate());
        }

        DoctorUnavailableDate d = new DoctorUnavailableDate(dto.getDate(), dto.getReason());
        availability.addUnavailableDate(d);
        d = unavailableDateRepository.save(d);

        return new UnavailableDateDto(d.getId(), d.getDate(), d.getReason());
    }

    @Transactional
    public void deleteUnavailableDate(Long doctorId, Long dateId) {
        DoctorUnavailableDate d = unavailableDateRepository.findById(dateId)
                .orElseThrow(() -> new ResourceNotFoundException("Unavailable date entry not found"));

        if (!d.getAvailability().getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("Entry does not belong to this doctor");
        }

        d.getAvailability().removeUnavailableDate(d);
        unavailableDateRepository.delete(d);
    }

    public AvailabilityDto mapToDto(DoctorAvailability a) {
        AvailabilityDto dto = new AvailabilityDto();
        dto.setId(a.getId());
        dto.setDoctorId(a.getDoctor() != null ? a.getDoctor().getId() : null);
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        dto.setSlotDurationMinutes(a.getSlotDurationMinutes());
        dto.setMaxPatientsPerDay(a.getMaxPatientsPerDay());
        dto.setMondayActive(a.isMondayActive());
        dto.setTuesdayActive(a.isTuesdayActive());
        dto.setWednesdayActive(a.isWednesdayActive());
        dto.setThursdayActive(a.isThursdayActive());
        dto.setFridayActive(a.isFridayActive());
        dto.setSaturdayActive(a.isSaturdayActive());
        dto.setSundayActive(a.isSundayActive());

        if (a.getBreaks() != null) {
            dto.setBreaks(a.getBreaks().stream()
                    .map(b -> new BreakDto(b.getId(), b.getTitle(), b.getStartTime(), b.getEndTime()))
                    .collect(Collectors.toList()));
        }

        if (a.getUnavailableDates() != null) {
            dto.setUnavailableDates(a.getUnavailableDates().stream()
                    .map(u -> new UnavailableDateDto(u.getId(), u.getDate(), u.getReason()))
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
