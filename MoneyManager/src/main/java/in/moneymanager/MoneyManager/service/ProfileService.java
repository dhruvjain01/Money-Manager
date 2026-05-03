package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.dto.LoginRequest;
import in.moneymanager.MoneyManager.dto.LoginResponse;
import in.moneymanager.MoneyManager.dto.ProfileDTO;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.entity.RefreshToken;
import in.moneymanager.MoneyManager.repository.ProfileRepository;
import in.moneymanager.MoneyManager.repository.RefreshTokenRepository;
import in.moneymanager.MoneyManager.util.JwtUtil;
import in.moneymanager.MoneyManager.util.PasswordValidator;
import in.moneymanager.MoneyManager.util.RefreshTokenUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordValidator passwordValidator;
    private final RefreshTokenUtil refreshTokenUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${money.manager.backend.url}")
    private String activationURL;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public ProfileDTO registerProfile(ProfileDTO profileDTO){
        if (profileDTO.getEmail() == null || profileDTO.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (profileRepository.findByEmail(profileDTO.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Validate the password strength
        passwordValidator.validate(profileDTO.getPassword());

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);
        //send activation email
        String activationTokenLink = activationURL + "/api/v1.0/activate?token=" + newProfile.getActivationToken();
        String subject = "Please Activate your Money Manager Account";
        String body = null;
        try {
            body = Files.readString(
                    Paths.get("src/main/resources/html/verify-mail.html"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String html = body.replace("{{ACTIVATION_LINK}}", activationTokenLink);
        emailService.sendHtmlEmail(newProfile.getEmail(), subject, html);
        return toDTO(newProfile);
    }

    private ProfileEntity toEntity(ProfileDTO profileDTO){
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .password(passwordEncoder.encode(profileDTO.getPassword()))
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();
    }

    private ProfileDTO toDTO(ProfileEntity profileEntity){
        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }

    public Boolean activateProfile(String activationToken){
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsActive(true);
                    profile.setActivationToken(null);
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    public Boolean isAccountActive(String email){
        return profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public ProfileEntity getCurrentProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication.getPrincipal() instanceof ProfileEntity profile) {
            return profile;
        }

        throw new UsernameNotFoundException("Profile not found with email " + authentication.getPrincipal());
    }

    public ProfileDTO getPublicProfile(String email){
        ProfileEntity currentUser = null;
        if(email == null){
            currentUser = getCurrentProfile();
        }
        else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email : " + email));
        }
        return toDTO(currentUser);
    }

    public LoginResponse login(LoginRequest request, HttpServletResponse response) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        ProfileEntity user = profileRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")
                );

        if (!isAccountActive(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before logging in");
        }

        String accessToken = jwtUtil.generateToken(user);

        // 🔐 NEW refresh session
        RefreshToken refreshToken = new RefreshToken();
        Instant now = Instant.now();
        String rawRefreshToken = refreshTokenUtil.generateToken();

        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenUtil.hashToken(rawRefreshToken));
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(now.plusMillis(refreshExpirationMs)); // 1 Day
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        ResponseCookie cookie = ResponseCookie.from("refreshToken",  rawRefreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(refreshExpirationMs) // 1 day
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return new LoginResponse(
                Long.toString(user.getId()),
                user.getEmail(),
                accessToken
        );
    }

    // ================= REFRESH =================

    public LoginResponse refresh(String refreshTokenValue, HttpServletResponse response) {

        if (refreshTokenValue == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token missing");
        }

        RefreshToken token = refreshTokenRepository
                .findByToken(refreshTokenUtil.hashToken(refreshTokenValue))
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token")
                );

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        // 🔁 Rotate token ONLY (do NOT extend expiry)
        String newRawTokenValue = refreshTokenUtil.generateToken();
        token.setToken(refreshTokenUtil.hashToken(newRawTokenValue));

        refreshTokenRepository.save(token);

        long remainingSeconds = remainingRefreshTokenTtlSeconds(token.getExpiresAt());

        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRawTokenValue)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(remainingSeconds) // 1 Day
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        String newAccessToken = jwtUtil.generateToken(token.getUser());

        return new LoginResponse(
                Long.toString(token.getUser().getId()),
                token.getUser().getEmail(),
                newAccessToken
        );
    }

    // ================= LOGOUT =================

    public void logout(String refreshTokenValue, HttpServletResponse response) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenUtil.hashToken(refreshTokenValue))
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(secureCookie ? "None" : "Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private long remainingRefreshTokenTtlSeconds(Instant expiresAt) {
        long seconds = Duration.between(Instant.now(), expiresAt).getSeconds();
        if (seconds <= 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        return seconds;
    }
}
