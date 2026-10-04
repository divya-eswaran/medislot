package com.medislot.medislot.service;

import com.medislot.medislot.dto.*;
import com.medislot.medislot.entity.*;
import com.medislot.medislot.exception.BadRequestException;
import com.medislot.medislot.exception.ResourceNotFoundException;
import com.medislot.medislot.exception.UnauthorizedException;
import com.medislot.medislot.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ConsultationService(
            ConsultationRepository consultationRepository,
            PrescriptionRepository prescriptionRepository,
            MedicalRecordRepository medicalRecordRepository,
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AppointmentDto completeConsultation(Long appointmentId, String doctorEmail, ConsultationRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        User user = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("You are not the doctor for this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot conduct consultation on a cancelled appointment");
        }

        // Save consultation
        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElse(new Consultation());
        consultation.setAppointment(appointment);
        consultation.setSymptoms(request.getSymptoms());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setConsultationNotes(request.getConsultationNotes());
        consultation.setTreatmentPlan(request.getTreatmentPlan());
        consultationRepository.save(consultation);

        // Handle prescription
        if (request.isCreatePrescription() || (request.getPrescriptionItems() != null && !request.getPrescriptionItems().isEmpty())) {
            Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                    .orElse(new Prescription());

            prescription.setAppointment(appointment);
            prescription.setDoctor(doctor);
            prescription.setPatient(appointment.getPatient());
            prescription.setDiagnosis(request.getDiagnosis());
            prescription.setInstructions(request.getPrescriptionInstructions());

            prescription.getItems().clear();
            if (request.getPrescriptionItems() != null) {
                for (PrescriptionItemDto itemDto : request.getPrescriptionItems()) {
                    PrescriptionItem item = new PrescriptionItem(
                            itemDto.getMedicineName(),
                            itemDto.getDosage(),
                            itemDto.getFrequency(),
                            itemDto.getDuration(),
                            itemDto.getInstructions()
                    );
                    prescription.addItem(item);
                }
            }
            prescriptionRepository.save(prescription);

            notificationService.createNotification(
                    appointment.getPatient().getUser(),
                    "Prescription Added",
                    "Dr. " + doctor.getFullName() + " has issued a prescription for your appointment.",
                    "PRESCRIPTION"
            );
        }

        // Create Medical Record
        MedicalRecord record = new MedicalRecord();
        record.setPatient(appointment.getPatient());
        record.setDoctor(doctor);
        record.setAppointment(appointment);
        record.setRecordType("Consultation Note");
        record.setTitle("Consultation with Dr. " + doctor.getFullName());
        record.setDescription("Diagnosis: " + (request.getDiagnosis() != null ? request.getDiagnosis() : "General Consultation"));
        record.setNotes(request.getConsultationNotes());
        record.setRecordDate(LocalDateTime.now());
        medicalRecordRepository.save(record);

        // Mark appointment as COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Consultation Completed",
                "Your consultation with Dr. " + doctor.getFullName() + " is completed. Your medical record is available.",
                "APPOINTMENT"
        );

        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setDoctorId(doctor.getId());
        dto.setDoctorName(doctor.getFullName());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getFullName());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setTokenNumber(appointment.getTokenNumber());
        dto.setStatus(appointment.getStatus());
        dto.setHasConsultation(true);
        dto.setHasPrescription(request.isCreatePrescription() || (request.getPrescriptionItems() != null && !request.getPrescriptionItems().isEmpty()));

        return dto;
    }

    public List<PrescriptionDto> getPrescriptionsForPatient(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapPrescriptionToDto)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDto> getPrescriptionsForDoctor(String doctorEmail) {
        User user = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId())
                .stream()
                .map(this::mapPrescriptionToDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDto getPrescriptionByAppointmentId(Long appointmentId) {
        Prescription p = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No prescription found for appointment id: " + appointmentId));
        return mapPrescriptionToDto(p);
    }

    public List<MedicalRecordDto> getMedicalRecordsForPatient(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patient.getId())
                .stream()
                .map(this::mapRecordToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDto> getMedicalRecordsForDoctor(String doctorEmail) {
        User user = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return medicalRecordRepository.findByDoctorIdOrderByRecordDateDesc(doctor.getId())
                .stream()
                .map(this::mapRecordToDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDto mapPrescriptionToDto(Prescription p) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(p.getId());
        dto.setAppointmentId(p.getAppointment() != null ? p.getAppointment().getId() : null);
        if (p.getDoctor() != null) {
            dto.setDoctorId(p.getDoctor().getId());
            dto.setDoctorName(p.getDoctor().getFullName());
            if (p.getDoctor().getSpecialization() != null) {
                dto.setDoctorSpecialization(p.getDoctor().getSpecialization().getName());
            }
        }
        if (p.getPatient() != null) {
            dto.setPatientId(p.getPatient().getId());
            dto.setPatientName(p.getPatient().getFullName());
        }
        dto.setDiagnosis(p.getDiagnosis());
        dto.setInstructions(p.getInstructions());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getItems() != null) {
            dto.setItems(p.getItems().stream()
                    .map(i -> new PrescriptionItemDto(i.getId(), i.getMedicineName(), i.getDosage(), i.getFrequency(), i.getDuration(), i.getInstructions()))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public MedicalRecordDto mapRecordToDto(MedicalRecord r) {
        MedicalRecordDto dto = new MedicalRecordDto();
        dto.setId(r.getId());
        if (r.getPatient() != null) {
            dto.setPatientId(r.getPatient().getId());
            dto.setPatientName(r.getPatient().getFullName());
        }
        if (r.getDoctor() != null) {
            dto.setDoctorId(r.getDoctor().getId());
            dto.setDoctorName(r.getDoctor().getFullName());
            if (r.getDoctor().getSpecialization() != null) {
                dto.setDoctorSpecialization(r.getDoctor().getSpecialization().getName());
            }
        }
        if (r.getAppointment() != null) {
            dto.setAppointmentId(r.getAppointment().getId());
        }
        dto.setRecordType(r.getRecordType());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setNotes(r.getNotes());
        dto.setRecordDate(r.getRecordDate());
        return dto;
    }
}
