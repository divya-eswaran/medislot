package com.medislot.medislot.config;

import com.medislot.medislot.entity.*;
import com.medislot.medislot.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SpecializationRepository specializationRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            ConsultationRepository consultationRepository,
            PrescriptionRepository prescriptionRepository,
            MedicalRecordRepository medicalRecordRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.specializationRepository = specializationRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.consultationRepository = consultationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Initialize Specializations if empty
        if (specializationRepository.count() == 0) {
            initSpecializations();
        }

        // Initialize Admin if not exists
        if (userRepository.findByEmail("admin@medislot.com").isEmpty()) {
            initAdmin();
        }

        // Initialize Demo Doctors if not exist
        if (doctorRepository.count() == 0) {
            initDemoDoctors();
        }

        // Initialize Demo Patients if not exist
        if (patientRepository.count() == 0) {
            initDemoPatientsAndAppointments();
        }
    }

    private void initSpecializations() {
        List<Specialization> specs = List.of(
                new Specialization("General Physician", "Primary healthcare, preventive medicine, fever, and common illness treatments.", "Stethoscope"),
                new Specialization("Cardiologist", "Diagnosis and treatment of heart defects, coronary artery disease, and heart health.", "HeartPulse"),
                new Specialization("Neurologist", "Specialized in disorders of the brain, spinal cord, and peripheral nerves.", "Brain"),
                new Specialization("Dermatologist", "Expert diagnosis and care for skin conditions, acne, eczema, and hair disorders.", "Sparkles"),
                new Specialization("Orthopedist", "Specialist in bones, joints, ligaments, tendons, and musculoskeletal trauma.", "Activity"),
                new Specialization("Pediatrician", "Compassionate and comprehensive medical care for infants, children, and adolescents.", "Baby"),
                new Specialization("Gynecologist", "Women's reproductive health, pregnancy care, fertility, and wellness.", "UserCheck"),
                new Specialization("Dentist", "Preventive, restorative, and aesthetic oral and dental healthcare.", "Smile"),
                new Specialization("ENT Specialist", "Diagnosis and surgery of ear, nose, throat, sinuses, and head/neck disorders.", "Ear"),
                new Specialization("Ophthalmologist", "Comprehensive eye examinations, vision therapy, and ophthalmic surgeries.", "Eye")
        );
        specializationRepository.saveAll(specs);
    }

    private void initAdmin() {
        User admin = new User();
        admin.setEmail("admin@medislot.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setMustChangePassword(false);
        userRepository.save(admin);

        notificationRepository.save(new Notification(
                admin,
                "System Initialized",
                "MediSlot Smart Healthcare System is running. Welcome to the Admin Control Center.",
                "SYSTEM"
        ));
    }

    private void initDemoDoctors() {
        Specialization cardiology = specializationRepository.findByNameIgnoreCase("Cardiologist").orElse(null);
        Specialization general = specializationRepository.findByNameIgnoreCase("General Physician").orElse(null);
        Specialization dermatology = specializationRepository.findByNameIgnoreCase("Dermatologist").orElse(null);
        Specialization pediatrics = specializationRepository.findByNameIgnoreCase("Pediatrician").orElse(null);
        Specialization neurology = specializationRepository.findByNameIgnoreCase("Neurologist").orElse(null);

        // 1. Dr. Ramesh Sharma - Cardiologist (Approved & Active)
        createDoctor(
                "dr.sharma@medislot.com",
                "Doctor@123",
                "Dr. Ramesh Sharma",
                "+91 9811223344",
                cardiology,
                "MBBS, MD (Medicine), DM (Cardiology) - AIIMS",
                16,
                120.0,
                "Senior Interventional Cardiologist with over 16 years of experience in adult cardiac care, hypertension management, and preventive heart screening.",
                "Heart Care Center, Block B, Metro Hospital, New Delhi",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                DoctorStatus.APPROVED,
                true,
                LocalTime.of(9, 0),
                LocalTime.of(17, 0),
                20,
                20,
                true, true, true, true, true, false, false,
                List.of(
                        new DoctorBreak("Lunch Break", LocalTime.of(13, 0), LocalTime.of(14, 0)),
                        new DoctorBreak("Evening Tea Break", LocalTime.of(16, 0), LocalTime.of(16, 20))
                )
        );

        // 2. Dr. Priya Patel - General Physician (Approved & Active)
        createDoctor(
                "dr.priya@medislot.com",
                "Doctor@123",
                "Dr. Priya Patel",
                "+91 9822334455",
                general,
                "MBBS, MD (Internal Medicine) - KEM Hospital",
                11,
                60.0,
                "Dedicated family physician focusing on holistic lifestyle medicine, chronic disease management, seasonal allergies, and health checkups.",
                "Apex Wellness Clinic, Suite 104, Powai, Mumbai",
                "https://images.unsplash.com/photo-1594824813583-7c307e814a05?w=400&auto=format&fit=crop&q=80",
                DoctorStatus.APPROVED,
                true,
                LocalTime.of(9, 0),
                LocalTime.of(16, 0),
                15,
                25,
                true, true, true, true, true, true, false,
                List.of(new DoctorBreak("Lunch Break", LocalTime.of(12, 30), LocalTime.of(13, 30)))
        );

        // 3. Dr. Rajesh Mehta - Dermatologist (Approved & Active)
        createDoctor(
                "dr.mehta@medislot.com",
                "Doctor@123",
                "Dr. Rajesh Mehta",
                "+91 9833445566",
                dermatology,
                "MBBS, DVD, MD (Dermatology, Venereology & Leprosy)",
                9,
                85.0,
                "Consultant Dermatologist & Cosmetologist specializing in modern aesthetic procedures, clinical dermatology, hair loss therapies, and eczema.",
                "Glow Skin & Laser Center, Indiranagar, Bengaluru",
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
                DoctorStatus.APPROVED,
                true,
                LocalTime.of(10, 0),
                LocalTime.of(18, 0),
                20,
                18,
                true, false, true, false, true, true, false,
                List.of(new DoctorBreak("Lunch Break", LocalTime.of(13, 0), LocalTime.of(14, 0)))
        );

        // 4. Dr. Ananya Sen - Pediatrician (Approved & Active)
        createDoctor(
                "dr.ananya@medislot.com",
                "Doctor@123",
                "Dr. Ananya Sen",
                "+91 9844556677",
                pediatrics,
                "MD (Pediatrics), DCH, Fellowship in Neonatology",
                13,
                75.0,
                "Compassionate child specialist with rich experience in child development, immunizations, pediatric infectious diseases, and newborn care.",
                "Little Smiles Children's Clinic, Salt Lake Sector 2, Kolkata",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                DoctorStatus.APPROVED,
                true,
                LocalTime.of(9, 0),
                LocalTime.of(15, 0),
                30,
                15,
                true, true, true, true, true, false, false,
                List.of(new DoctorBreak("Lunch Break", LocalTime.of(12, 0), LocalTime.of(13, 0)))
        );

        // 5. Dr. Kavita Joshi - Neurologist (PENDING for Admin Approval Demo)
        createDoctor(
                "dr.kavita@medislot.com",
                "Doctor@123",
                "Dr. Kavita Joshi",
                "+91 9855667788",
                neurology,
                "MBBS, DM (Neurology), Post-Doc Fellow (Epilepsy)",
                7,
                110.0,
                "Neurology consultant specializing in migraine treatment, stroke prevention, neuropathy, and movement disorders.",
                "Neuro Spine Hospital, Banjara Hills, Hyderabad",
                "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80",
                DoctorStatus.PENDING,
                true,
                LocalTime.of(9, 0),
                LocalTime.of(17, 0),
                20,
                20,
                true, true, true, true, true, false, false,
                List.of(new DoctorBreak("Lunch Break", LocalTime.of(13, 0), LocalTime.of(14, 0)))
        );
    }

    private void createDoctor(
            String email,
            String password,
            String fullName,
            String phone,
            Specialization spec,
            String qualification,
            int experienceYears,
            double fee,
            String bio,
            String clinicAddress,
            String profileImage,
            DoctorStatus status,
            boolean active,
            LocalTime startTime,
            LocalTime endTime,
            int slotDuration,
            int maxPatients,
            boolean mon, boolean tue, boolean wed, boolean thu, boolean fri, boolean sat, boolean sun,
            List<DoctorBreak> breaks) {

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.DOCTOR);
        user.setActive(active);
        user.setMustChangePassword(false);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFullName(fullName);
        doctor.setPhone(phone);
        doctor.setSpecialization(spec);
        doctor.setQualification(qualification);
        doctor.setExperienceYears(experienceYears);
        doctor.setConsultationFee(fee);
        doctor.setBio(bio);
        doctor.setClinicAddress(clinicAddress);
        doctor.setProfileImage(profileImage);
        doctor.setStatus(status);
        doctor.setActive(active);

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setSlotDurationMinutes(slotDuration);
        availability.setMaxPatientsPerDay(maxPatients);
        availability.setMondayActive(mon);
        availability.setTuesdayActive(tue);
        availability.setWednesdayActive(wed);
        availability.setThursdayActive(thu);
        availability.setFridayActive(fri);
        availability.setSaturdayActive(sat);
        availability.setSundayActive(sun);

        if (breaks != null) {
            for (DoctorBreak b : breaks) {
                availability.addBreak(b);
            }
        }

        doctor.setAvailability(availability);
        doctorRepository.save(doctor);
    }

    private void initDemoPatientsAndAppointments() {
        // Patient 1: Rahul Verma
        User user1 = new User();
        user1.setEmail("rahul@gmail.com");
        user1.setPassword(passwordEncoder.encode("Patient@123"));
        user1.setRole(Role.PATIENT);
        user1.setActive(true);
        user1.setMustChangePassword(false);
        user1 = userRepository.save(user1);

        Patient patient1 = new Patient();
        patient1.setUser(user1);
        patient1.setFullName("Rahul Verma");
        patient1.setPhone("+91 9876543210");
        patient1.setDateOfBirth(LocalDate.of(1994, 5, 14));
        patient1.setGender("Male");
        patient1.setBloodGroup("O+");
        patient1.setAddress("42 Lakeview Enclave, New Delhi, India");
        patient1.setEmergencyContact("+91 9876543299 (Spouse)");
        patient1 = patientRepository.save(patient1);

        // Patient 2: Sneha Rao
        User user2 = new User();
        user2.setEmail("sneha@gmail.com");
        user2.setPassword(passwordEncoder.encode("Patient@123"));
        user2.setRole(Role.PATIENT);
        user2.setActive(true);
        user2.setMustChangePassword(false);
        user2 = userRepository.save(user2);

        Patient patient2 = new Patient();
        patient2.setUser(user2);
        patient2.setFullName("Sneha Rao");
        patient2.setPhone("+91 9876543211");
        patient2.setDateOfBirth(LocalDate.of(1998, 9, 22));
        patient2.setGender("Female");
        patient2.setBloodGroup("B+");
        patient2.setAddress("12 Palm Avenue, Mumbai, India");
        patient2.setEmergencyContact("+91 9876543288 (Father)");
        patient2 = patientRepository.save(patient2);

        // Seed Appointments
        Doctor drSharma = doctorRepository.findByUserEmail("dr.sharma@medislot.com").orElse(null);
        Doctor drPriya = doctorRepository.findByUserEmail("dr.priya@medislot.com").orElse(null);

        LocalDate today = LocalDate.now();

        if (drSharma != null) {
            // Appointment 1: Upcoming confirmed appointment for Rahul with Dr. Sharma
            Appointment appt1 = new Appointment();
            appt1.setDoctor(drSharma);
            appt1.setPatient(patient1);
            appt1.setAppointmentDate(today.plusDays(1));
            appt1.setStartTime(LocalTime.of(9, 40));
            appt1.setEndTime(LocalTime.of(10, 0));
            appt1.setTokenNumber(1);
            appt1.setStatus(AppointmentStatus.CONFIRMED);
            appt1.setReason("Routine cardiac evaluation and ECG review.");
            appointmentRepository.save(appt1);

            notificationRepository.save(new Notification(
                    user1,
                    "Appointment Confirmed",
                    "Your appointment with Dr. Ramesh Sharma on " + today.plusDays(1) + " at 09:40 is confirmed. Token #1.",
                    "APPOINTMENT"
            ));
        }

        if (drPriya != null) {
            // Appointment 2: Completed consultation for Rahul with Dr. Priya Patel
            Appointment appt2 = new Appointment();
            appt2.setDoctor(drPriya);
            appt2.setPatient(patient1);
            appt2.setAppointmentDate(today.minusDays(3));
            appt2.setStartTime(LocalTime.of(10, 0));
            appt2.setEndTime(LocalTime.of(10, 15));
            appt2.setTokenNumber(1);
            appt2.setStatus(AppointmentStatus.COMPLETED);
            appt2.setReason("Chest congestion, sore throat, and persistent dry cough.");
            appt2 = appointmentRepository.save(appt2);

            // Consultation Record
            Consultation consultation = new Consultation();
            consultation.setAppointment(appt2);
            consultation.setSymptoms("Persistent dry cough for 4 days, mild throat pain, low grade fever (99.5F).");
            consultation.setDiagnosis("Acute Upper Respiratory Tract Infection (Seasonal).");
            consultation.setConsultationNotes("Chest clear bilaterally on auscultation. Throat congested with mild pharyngeal erythema. SpO2 98% at room air.");
            consultation.setTreatmentPlan("Warm saline gargles, adequate hydration, rest, and prescribed medication for 5 days.");
            consultationRepository.save(consultation);

            // Prescription
            Prescription prescription = new Prescription();
            prescription.setAppointment(appt2);
            prescription.setDoctor(drPriya);
            prescription.setPatient(patient1);
            prescription.setDiagnosis("Acute Upper Respiratory Infection");
            prescription.setInstructions("Take all tablets after meals. Avoid chilled beverages.");
            prescription.addItem(new PrescriptionItem("Amoxicillin + Clavulanic Acid 625mg", "1 Tablet", "Twice daily (1-0-1)", "5 Days", "Take with meals"));
            prescription.addItem(new PrescriptionItem("Montelukast + Levocetirizine 10mg", "1 Tablet", "Once at night (0-0-1)", "5 Days", "Take before bedtime"));
            prescription.addItem(new PrescriptionItem("Paracetamol 650mg", "1 Tablet", "SOS / as needed", "3 Days", "Only if temperature > 100 F"));
            prescriptionRepository.save(prescription);

            // Medical Record
            MedicalRecord record = new MedicalRecord();
            record.setPatient(patient1);
            record.setDoctor(drPriya);
            record.setAppointment(appt2);
            record.setRecordType("Consultation & Prescription");
            record.setTitle("URTI & Seasonal Cough Consultation");
            record.setDescription("Acute Upper Respiratory Tract Infection treated with antibiotics and antihistamines.");
            record.setNotes("Patient advised to review if symptoms do not improve in 5 days.");
            record.setRecordDate(LocalDateTime.now().minusDays(3));
            medicalRecordRepository.save(record);

            // Appointment 3: Confirmed appointment for Sneha with Dr. Priya
            Appointment appt3 = new Appointment();
            appt3.setDoctor(drPriya);
            appt3.setPatient(patient2);
            appt3.setAppointmentDate(today.plusDays(2));
            appt3.setStartTime(LocalTime.of(11, 0));
            appt3.setEndTime(LocalTime.of(11, 15));
            appt3.setTokenNumber(1);
            appt3.setStatus(AppointmentStatus.CONFIRMED);
            appt3.setReason("Annual wellness blood work review and fatigue check.");
            appointmentRepository.save(appt3);
        }
    }
}
