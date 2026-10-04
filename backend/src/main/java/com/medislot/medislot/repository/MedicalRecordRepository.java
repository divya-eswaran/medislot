package com.medislot.medislot.repository;

import com.medislot.medislot.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);
    List<MedicalRecord> findByDoctorIdOrderByRecordDateDesc(Long doctorId);
    List<MedicalRecord> findByPatientIdAndDoctorIdOrderByRecordDateDesc(Long patientId, Long doctorId);
}
