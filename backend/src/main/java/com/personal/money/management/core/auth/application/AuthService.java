package com.personal.money.management.core.auth.application;

import com.personal.money.management.core.auth.application.dto.*;
import com.personal.money.management.core.auth.application.security.CustomUserDetails;
import com.personal.money.management.core.auth.application.security.SecurityUtils;
import com.personal.money.management.core.auth.domain.model.Role;
import com.personal.money.management.core.auth.domain.model.User;
import com.personal.money.management.core.auth.domain.repository.RoleRepository;
import com.personal.money.management.core.auth.domain.repository.UserRepository;
import com.personal.money.management.core.auth.infrastructure.jwt.JwtUtil;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER", "Standard user")));

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );
        user.addRole(userRole);
        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                List.of("ROLE_USER")
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );
    }

    public UserDTO getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getStatus().name(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String newToken = jwtUtil.generateToken(userDetails);

        return new AuthResponse(
                newToken,
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toList())
        );
    }
}