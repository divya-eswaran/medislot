package com.medislot.medislot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleRequest {

    @NotNull(message = "New appointment date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate newAppointmentDate;

    @NotNull(message = "New start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime newStartTime;

    private String reason;

    public RescheduleRequest() {
    }

    public LocalDate getNewAppointmentDate() {
        return newAppointmentDate;
    }

    public void setNewAppointmentDate(LocalDate newAppointmentDate) {
        this.newAppointmentDate = newAppointmentDate;
    }

    public LocalTime getNewStartTime() {
        return newStartTime;
    }

    public void setNewStartTime(LocalTime newStartTime) {
        this.newStartTime = newStartTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
