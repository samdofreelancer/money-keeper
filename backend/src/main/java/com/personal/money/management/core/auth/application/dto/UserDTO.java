package com.personal.money.management.core.auth.application.dto;

import java.util.List;

public class UserDTO {

    private Long id;
    private String email;
    private String fullName;
    private String status;
    private List<String> roles;

    public UserDTO() {}

    public UserDTO(Long id, String email, String fullName, String status, List<String> roles) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.status = status;
        this.roles = roles;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}