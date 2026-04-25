package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.entity.PasswordResetToken;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.repository.PasswordResetTokenRepository;
import in.moneymanager.MoneyManager.repository.ProfileRepository;
import in.moneymanager.MoneyManager.repository.RefreshTokenRepository;
import in.moneymanager.MoneyManager.util.PasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository repo;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public PasswordResetToken createResetToken(ProfileEntity profile) {
        invalidateUnusedResetTokens(profile);

        return repo.save(
                PasswordResetToken.builder()
                        .token(UUID.randomUUID().toString())
                        .profile(profile)
                        .expiryDate(Instant.now().plusSeconds(10 * 60)) // 10 min
                        .used(false)
                        .build()
        );
    }

    public PasswordResetToken validateToken(String token) {
        PasswordResetToken prt = repo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token"));

        if (prt.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token already used");
        }

        if (prt.getExpiryDate().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");
        }

        return prt;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password cannot be empty");
        }

        passwordValidator.validate(newPassword);

        PasswordResetToken prt = validateToken(token);
        ProfileEntity user = prt.getProfile();

        user.setPassword(passwordEncoder.encode(newPassword));
        profileRepository.save(user);

        prt.setUsed(true);
        repo.save(prt);

        revokeAllActiveRefreshTokens(user);
    }

    private void invalidateUnusedResetTokens(ProfileEntity profile) {
        List<PasswordResetToken> existingTokens = repo.findAllByProfileAndUsedFalse(profile);
        if (existingTokens.isEmpty()) {
            return;
        }

        for (PasswordResetToken existingToken : existingTokens) {
            existingToken.setUsed(true);
        }
        repo.saveAll(existingTokens);
    }

    private void revokeAllActiveRefreshTokens(ProfileEntity profile) {
        var activeTokens = refreshTokenRepository.findAllByUserAndRevokedFalse(profile);
        if (activeTokens.isEmpty()) {
            return;
        }

        for (var activeToken : activeTokens) {
            activeToken.setRevoked(true);
        }
        refreshTokenRepository.saveAll(activeTokens);
    }
}
