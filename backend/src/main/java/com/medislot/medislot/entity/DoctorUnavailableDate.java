package com.medislot.medislot.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_unavailable_dates")
public class DoctorUnavailableDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    @JsonBackReference
    private DoctorAvailability availability;

    @Column(name = "unavailable_date", nullable = false)
    private LocalDate date;

    private String reason;

    public DoctorUnavailableDate() {
    }

    public DoctorUnavailableDate(LocalDate date, String reason) {
        this.date = date;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DoctorAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(DoctorAvailability availability) {
        this.availability = availability;
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
