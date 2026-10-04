package com.medislot.medislot.repository;

import com.medislot.medislot.entity.DoctorBreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorBreakRepository extends JpaRepository<DoctorBreak, Long> {
    List<DoctorBreak> findByAvailabilityId(Long availabilityId);
}
