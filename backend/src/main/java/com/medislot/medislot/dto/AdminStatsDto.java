package com.medislot.medislot.dto;

import java.util.Map;

public class AdminStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long activeDoctors;
    private long pendingDoctorAccounts;
    private long totalAppointments;
    private long todayAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private Map<String, Long> appointmentsBySpecialization;
    private Map<String, Long> appointmentsByStatus;

    public AdminStatsDto() {
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getActiveDoctors() {
        return activeDoctors;
    }

    public void setActiveDoctors(long activeDoctors) {
        this.activeDoctors = activeDoctors;
    }

    public long getPendingDoctorAccounts() {
        return pendingDoctorAccounts;
    }

    public void setPendingDoctorAccounts(long pendingDoctorAccounts) {
        this.pendingDoctorAccounts = pendingDoctorAccounts;
    }

    public long getPendingDoctors() {
        return pendingDoctorAccounts;
    }

    public void setPendingDoctors(long pendingDoctors) {
        this.pendingDoctorAccounts = pendingDoctors;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }

    public Map<String, Long> getAppointmentsBySpecialization() {
        return appointmentsBySpecialization;
    }

    public void setAppointmentsBySpecialization(Map<String, Long> appointmentsBySpecialization) {
        this.appointmentsBySpecialization = appointmentsBySpecialization;
    }

    public Map<String, Long> getAppointmentsByStatus() {
        return appointmentsByStatus;
    }

    public void setAppointmentsByStatus(Map<String, Long> appointmentsByStatus) {
        this.appointmentsByStatus = appointmentsByStatus;
    }
}
