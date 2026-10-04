package com.medislot.medislot.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctor_availabilities")
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false, unique = true)
    @JsonBackReference
    private Doctor doctor;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime = LocalTime.of(9, 0);

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime = LocalTime.of(17, 0);

    @Column(name = "slot_duration_minutes", nullable = false)
    private int slotDurationMinutes = 20;

    @Column(name = "max_patients_per_day", nullable = false)
    private int maxPatientsPerDay = 20;

    // Working days
    @Column(name = "monday_active")
    private boolean mondayActive = true;

    @Column(name = "tuesday_active")
    private boolean tuesdayActive = true;

    @Column(name = "wednesday_active")
    private boolean wednesdayActive = true;

    @Column(name = "thursday_active")
    private boolean thursdayActive = true;

    @Column(name = "friday_active")
    private boolean fridayActive = true;

    @Column(name = "saturday_active")
    private boolean saturdayActive = false;

    @Column(name = "sunday_active")
    private boolean sundayActive = false;

    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<DoctorBreak> breaks = new ArrayList<>();

    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<DoctorUnavailableDate> unavailableDates = new ArrayList<>();

    public DoctorAvailability() {
    }

    public boolean isWorkingDay(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> mondayActive;
            case TUESDAY -> tuesdayActive;
            case WEDNESDAY -> wednesdayActive;
            case THURSDAY -> thursdayActive;
            case FRIDAY -> fridayActive;
            case SATURDAY -> saturdayActive;
            case SUNDAY -> sundayActive;
        };
    }

    public void addBreak(DoctorBreak doctorBreak) {
        breaks.add(doctorBreak);
        doctorBreak.setAvailability(this);
    }

    public void removeBreak(DoctorBreak doctorBreak) {
        breaks.remove(doctorBreak);
        doctorBreak.setAvailability(null);
    }

    public void addUnavailableDate(DoctorUnavailableDate unavailableDate) {
        unavailableDates.add(unavailableDate);
        unavailableDate.setAvailability(this);
    }

    public void removeUnavailableDate(DoctorUnavailableDate unavailableDate) {
        unavailableDates.remove(unavailableDate);
        unavailableDate.setAvailability(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public int getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(int slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public int getMaxPatientsPerDay() {
        return maxPatientsPerDay;
    }

    public void setMaxPatientsPerDay(int maxPatientsPerDay) {
        this.maxPatientsPerDay = maxPatientsPerDay;
    }

    public boolean isMondayActive() {
        return mondayActive;
    }

    public void setMondayActive(boolean mondayActive) {
        this.mondayActive = mondayActive;
    }

    public boolean isTuesdayActive() {
        return tuesdayActive;
    }

    public void setTuesdayActive(boolean tuesdayActive) {
        this.tuesdayActive = tuesdayActive;
    }

    public boolean isWednesdayActive() {
        return wednesdayActive;
    }

    public void setWednesdayActive(boolean wednesdayActive) {
        this.wednesdayActive = wednesdayActive;
    }

    public boolean isThursdayActive() {
        return thursdayActive;
    }

    public void setThursdayActive(boolean thursdayActive) {
        this.thursdayActive = thursdayActive;
    }

    public boolean isFridayActive() {
        return fridayActive;
    }

    public void setFridayActive(boolean fridayActive) {
        this.fridayActive = fridayActive;
    }

    public boolean isSaturdayActive() {
        return saturdayActive;
    }

    public void setSaturdayActive(boolean saturdayActive) {
        this.saturdayActive = saturdayActive;
    }

    public boolean isSundayActive() {
        return sundayActive;
    }

    public void setSundayActive(boolean sundayActive) {
        this.sundayActive = sundayActive;
    }

    public List<DoctorBreak> getBreaks() {
        return breaks;
    }

    public void setBreaks(List<DoctorBreak> breaks) {
        this.breaks = breaks;
    }

    public List<DoctorUnavailableDate> getUnavailableDates() {
        return unavailableDates;
    }

    public void setUnavailableDates(List<DoctorUnavailableDate> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }
}
