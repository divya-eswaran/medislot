package com.medislot.medislot.dto;

import com.medislot.medislot.entity.Role;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long roleProfileId; // doctorId or patientId
    private boolean mustChangePassword;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String email, String fullName, Role role, Long roleProfileId, boolean mustChangePassword) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.roleProfileId = roleProfileId;
        this.mustChangePassword = mustChangePassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getRoleProfileId() {
        return roleProfileId;
    }

    public void setRoleProfileId(Long roleProfileId) {
        this.roleProfileId = roleProfileId;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}
