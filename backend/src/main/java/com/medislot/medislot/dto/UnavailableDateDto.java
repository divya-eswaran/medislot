package com.medislot.medislot.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UnavailableDateDto {
    private Long id;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String reason;

    public UnavailableDateDto() {
    }

    public UnavailableDateDto(Long id, LocalDate date, String reason) {
        this.id = id;
        this.date = date;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
