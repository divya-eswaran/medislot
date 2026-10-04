package com.medislot.medislot.repository;

import com.medislot.medislot.entity.DoctorUnavailableDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorUnavailableDateRepository extends JpaRepository<DoctorUnavailableDate, Long> {
    List<DoctorUnavailableDate> findByAvailabilityId(Long availabilityId);
    boolean existsByAvailabilityIdAndDate(Long availabilityId, LocalDate date);
}
