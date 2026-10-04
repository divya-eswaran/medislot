package com.medislot.medislot.repository;

import com.medislot.medislot.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    Optional<DoctorAvailability> findByDoctorId(Long doctorId);
}
