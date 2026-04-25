package in.moneymanager.MoneyManager.repository;

import in.moneymanager.MoneyManager.entity.PasswordResetToken;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    List<PasswordResetToken> findAllByProfileAndUsedFalse(ProfileEntity profile);
}
