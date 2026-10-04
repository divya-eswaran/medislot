package com.medislot.medislot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class AvailabilityDto {
    private Long id;
    private Long doctorId;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime = LocalTime.of(9, 0);

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime = LocalTime.of(17, 0);

    private int slotDurationMinutes = 20;
    private int maxPatientsPerDay = 20;

    private boolean mondayActive = true;
    private boolean tuesdayActive = true;
    private boolean wednesdayActive = true;
    private boolean thursdayActive = true;
    private boolean fridayActive = true;
    private boolean saturdayActive = false;
    private boolean sundayActive = false;

    private List<BreakDto> breaks = new ArrayList<>();
    private List<UnavailableDateDto> unavailableDates = new ArrayList<>();

    public AvailabilityDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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

    public List<BreakDto> getBreaks() {
        return breaks;
    }

    public void setBreaks(List<BreakDto> breaks) {
        this.breaks = breaks;
    }

    public List<UnavailableDateDto> getUnavailableDates() {
        return unavailableDates;
    }

    public void setUnavailableDates(List<UnavailableDateDto> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }
}
