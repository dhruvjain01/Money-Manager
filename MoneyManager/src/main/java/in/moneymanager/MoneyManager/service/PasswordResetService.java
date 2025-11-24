package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.entity.PasswordResetToken;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository repo;

    public PasswordResetToken createResetToken(ProfileEntity profile) {
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

    public void markUsed(PasswordResetToken token) {
        token.setUsed(true);
        repo.save(token);
    }
}
