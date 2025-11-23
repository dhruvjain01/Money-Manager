package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.entity.RefreshToken;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    // Create initial refresh token with a family expiry
    public RefreshToken createRefreshToken(ProfileEntity profile) {
        Instant familyExpiry = Instant.now().plusSeconds(3 * 24 * 60 * 60); // 3 days
        String familyId = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .familyId(familyId)
                .expiryDate(familyExpiry)
                .profile(profile)
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    // Rotate an incoming refresh token: single-use
    public RefreshToken rotateRefreshToken(String oldToken) {
        RefreshToken existing = refreshTokenRepository.findByToken(oldToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // if already revoked -> possible reuse attack
        if (existing.isRevoked()) {
            // revoke the entire family FIRST (persist the change) then raise exception
            System.out.println("revoke the entire family FIRST (persist the change) then raise exception");
            revokeFamily(existing.getFamilyId());
            throw new RuntimeException("Refresh token already used (possible theft)");
        }

        // if expired
        if (existing.getExpiryDate().isBefore(Instant.now())) {
            // optionally revoke family on expiry as well (security policy)
            revokeFamily(existing.getFamilyId());
            throw new RuntimeException("Refresh token expired");
        }

        // create new token with same family expiry and familyId (do NOT extend expiry)
        RefreshToken newToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .familyId(existing.getFamilyId())
                .expiryDate(existing.getExpiryDate())
                .profile(existing.getProfile())
                .revoked(false)
                .build();

        // mark existing as revoked and link to new one (persist)
        existing.setRevoked(true);
        existing.setReplacedBy(newToken.getToken());
        refreshTokenRepository.save(existing);

        return refreshTokenRepository.save(newToken);
    }

    // Revoke all tokens in a family/session
    @Transactional
    public void revokeFamily(String familyId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByFamilyId(familyId);
        for (RefreshToken t : tokens) {
            t.setRevoked(true);
        }
        refreshTokenRepository.saveAll(tokens);
    }
}
