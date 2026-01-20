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

import java.time.Instant;
import java.util.*;

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

    public ProfileDTO registerProfile(ProfileDTO profileDTO){
        // Validate the password strength
        passwordValidator.validate(profileDTO.getPassword());

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);
        //send activation email
        String activationTokenLink = activationURL + "/api/v1.0/activate?token=" + newProfile.getActivationToken();
        String subject = "Please Activate your Money Manager Account";
        String body = "Thank you for signing up! Please activate your money manager account by clicking on the following link : " + activationTokenLink;
        emailService.sendEmail(newProfile.getEmail(), subject, body);
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
                    .orElseThrow(() -> new UsernameNotFoundException("Profile Not  found with email : " + email));
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
                        new RuntimeException("User not found")
                );

        if (!isAccountActive(user.getEmail())) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        String accessToken = jwtUtil.generateToken(user);

        // 🔐 NEW refresh session
        RefreshToken refreshToken = new RefreshToken();
        Instant now = Instant.now();

        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenUtil.generateToken());
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(now.plusSeconds(24 * 60 * 60)); // 1 Day
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        List<String> paths = List.of("/login", "/register", "/logout","/activate","/reset-password","/forgot-password","/validate-reset-token","/refresh");

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .httpOnly(true)
                .secure(false) // localhost
                .sameSite("Strict")
                .path(String.valueOf(paths))
                .maxAge(24 * 60 * 60) // 1 day
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
            throw new RuntimeException("Refresh token missing");
        }

        RefreshToken token = refreshTokenRepository
                .findByToken(refreshTokenValue)
                .orElseThrow(() ->
                        new RuntimeException("Invalid refresh token")
                );

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        // 🔁 Rotate token ONLY (do NOT extend expiry)
        String newTokenValue = refreshTokenUtil.generateToken();
        token.setToken(newTokenValue);

        refreshTokenRepository.save(token);

        List<String> paths = List.of("/login", "/register", "/logout","/activate","/reset-password","/forgot-password","/validate-reset-token","/refresh");

        ResponseCookie cookie = ResponseCookie.from("refreshToken", newTokenValue)
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .path(String.valueOf(paths))
                .maxAge(24 * 60 * 60) // 1 Day
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

        System.out.println("LOGOUT");
        System.out.println("RT : " + refreshTokenValue);
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }

        List<String> paths = List.of("/login", "/register", "/logout","/activate","/reset-password","/forgot-password","/validate-reset-token","/refresh");

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path(String.valueOf(paths))
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}
