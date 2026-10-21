package com.medislot.medislot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DoctorCreateRequest {

    private String fullName;
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String temporaryPassword; // Optional, defaults to a secure temp password

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Specialization ID is required")
    private Long specializationId;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    private Integer experienceYears = 0;
    private Double consultationFee = 0.0;
    private String bio;
    private String clinicAddress;
    private String profileImage;
    private boolean autoApprove = true;

    public DoctorCreateRequest() {
    }

    public String getFullName() {
        return fullName != null && !fullName.trim().isEmpty() ? fullName : name;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        if (this.name == null) {
            this.name = fullName;
        }
    }

    public String getName() {
        return getFullName();
    }

    public void setName(String name) {
        this.name = name;
        if (this.fullName == null) {
            this.fullName = name;
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getSpecializationId() {
        return specializationId;
    }

    public void setSpecializationId(Long specializationId) {
        this.specializationId = specializationId;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public boolean isAutoApprove() {
        return autoApprove;
    }

    public void setAutoApprove(boolean autoApprove) {
        this.autoApprove = autoApprove;
    }
}
