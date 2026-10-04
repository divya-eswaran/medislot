package com.medislot.medislot.dto;

import jakarta.validation.constraints.NotBlank;

public class SpecializationDto {
    private Long id;

    @NotBlank(message = "Specialization name is required")
    private String name;

    private String description;
    private String icon;
    private long doctorCount;

    public SpecializationDto() {
    }

    public SpecializationDto(Long id, String name, String description, String icon, long doctorCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.doctorCount = doctorCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public long getDoctorCount() {
        return doctorCount;
    }

    public void setDoctorCount(long doctorCount) {
        this.doctorCount = doctorCount;
    }
}
