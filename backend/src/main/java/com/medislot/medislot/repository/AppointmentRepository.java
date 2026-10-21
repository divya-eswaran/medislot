package com.medislot.medislot.repository;

import com.medislot.medislot.entity.Appointment;
import com.medislot.medislot.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(Long doctorId, LocalDate date);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate date, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status NOT IN ('CANCELLED', 'REJECTED')")
    long countActiveAppointmentsByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    int findMaxTokenNumber(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.startTime = :startTime " +
           "AND a.status NOT IN ('CANCELLED', 'REJECTED')")
    boolean isSlotBooked(@Param("doctorId") Long doctorId, @Param("date") LocalDate date, @Param("startTime") LocalTime startTime);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.startTime = :startTime " +
           "AND a.id <> :excludeAppointmentId AND a.status NOT IN ('CANCELLED', 'REJECTED')")
    boolean isSlotBookedExcluding(@Param("doctorId") Long doctorId, @Param("date") LocalDate date, @Param("startTime") LocalTime startTime, @Param("excludeAppointmentId") Long excludeAppointmentId);

    long countByAppointmentDate(LocalDate date);

    long countByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDate >= :today AND a.status NOT IN ('CANCELLED', 'REJECTED', 'COMPLETED') ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<Appointment> findUpcomingAppointmentsForPatient(@Param("patientId") Long patientId, @Param("today") LocalDate today);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :today ORDER BY a.tokenNumber ASC")
    List<Appointment> findTodayAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("today") LocalDate today);

    @Query("SELECT a FROM Appointment a WHERE a.status IN (com.medislot.medislot.entity.AppointmentStatus.CONFIRMED, com.medislot.medislot.entity.AppointmentStatus.PENDING) AND (a.appointmentDate < :today OR (a.appointmentDate = :today AND a.endTime < :now))")
    List<Appointment> findPastUncompletedAppointments(@Param("today") LocalDate today, @Param("now") LocalTime now);
}
