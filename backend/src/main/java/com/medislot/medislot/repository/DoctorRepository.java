package com.medislot.medislot.repository;

import com.medislot.medislot.entity.Doctor;
import com.medislot.medislot.entity.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    Optional<Doctor> findByUserEmail(String email);

    List<Doctor> findByStatusAndActiveTrue(DoctorStatus status);

    @Query("SELECT d FROM Doctor d WHERE d.status = :status AND d.active = true AND d.specialization.id = :specId")
    List<Doctor> findBySpecializationIdAndStatusAndActiveTrue(@Param("specId") Long specId, @Param("status") DoctorStatus status);

    @Query("SELECT d FROM Doctor d WHERE d.status = 'APPROVED' AND d.active = true AND " +
           "(LOWER(d.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.specialization.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Doctor> searchApprovedActiveDoctors(@Param("query") String query);

    long countByStatus(DoctorStatus status);
    long countByActiveTrueAndStatus(DoctorStatus status);
}
