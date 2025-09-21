package com.personal.money.management.core.authentication.interfaces.api;

import com.personal.money.management.core.authentication.application.JwtService;
import com.personal.money.management.core.authentication.application.UserService;
import com.personal.money.management.core.authentication.domain.User;
import com.personal.money.management.core.authentication.interfaces.api.dto.AuthResponse;
import com.personal.money.management.core.authentication.interfaces.api.dto.LoginRequest;
import com.personal.money.management.core.authentication.interfaces.api.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthenticationController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerNewUser(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(new AuthResponse(null, "Registration successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userService.authenticateUser(request.getUsername(), request.getPassword());
        if (userOptional.isPresent()) {
            String token = jwtService.generateToken(request.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, "Login successful"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, "Invalid credentials"));
        }
    }
}
