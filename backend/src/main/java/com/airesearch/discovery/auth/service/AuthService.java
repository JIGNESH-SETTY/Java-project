package com.airesearch.discovery.auth.service;

import com.airesearch.discovery.auth.dto.*;
import com.airesearch.discovery.auth.model.RefreshToken;
import com.airesearch.discovery.auth.model.User;
import com.airesearch.discovery.auth.repository.RefreshTokenRepository;
import com.airesearch.discovery.auth.repository.UserRepository;
import com.airesearch.discovery.auth.security.JwtTokenProvider;
import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.shared.enums.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshTokenExpirationMs;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        UserRole role = request.role() != null ? request.role() : UserRole.ROLE_USER;
        User newUser = new User(
                UUID.randomUUID(),
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()),
                request.displayName().trim(),
                role,
                Instant.now(),
                Instant.now()
        );

        User savedUser = userRepository.save(newUser);
        return createAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshRequest request) {
        String rawToken = request.refreshToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (!storedToken.isValid()) {
            throw new BadCredentialsException("Refresh token is expired or revoked");
        }

        // Revoke the old token (rotation policy)
        refreshTokenRepository.revokeByTokenHash(tokenHash);

        User user = userRepository.findById(storedToken.userId())
                .orElseThrow(() -> new BadCredentialsException("User no longer exists"));

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            String tokenHash = hashToken(refreshToken);
            refreshTokenRepository.revokeByTokenHash(tokenHash);
        }
    }

    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return new UserDto(user.id(), user.email(), user.displayName(), user.role(), user.createdAt());
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.id(), user.email(), user.role().name());

        // Generate cryptographically random refresh token
        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(rawRefreshToken);
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpirationMs);

        RefreshToken token = new RefreshToken(
                UUID.randomUUID(),
                user.id(),
                tokenHash,
                expiresAt,
                null,
                Instant.now()
        );
        refreshTokenRepository.save(token);

        UserDto userDto = new UserDto(user.id(), user.email(), user.displayName(), user.role(), user.createdAt());
        return AuthResponse.of(accessToken, rawRefreshToken, jwtTokenProvider.getAccessTokenExpirationMs(), userDto);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
