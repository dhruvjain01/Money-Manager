package in.moneymanager.MoneyManager.repository;

import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
}
