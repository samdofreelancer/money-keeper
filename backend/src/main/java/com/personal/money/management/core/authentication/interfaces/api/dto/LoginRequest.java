package com.personal.money.management.core.authentication.interfaces.api.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
