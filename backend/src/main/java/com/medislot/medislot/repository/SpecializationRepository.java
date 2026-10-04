package com.medislot.medislot.repository;

import com.medislot.medislot.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    Optional<Specialization> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
