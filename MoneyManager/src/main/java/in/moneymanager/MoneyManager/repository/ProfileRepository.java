package in.moneymanager.MoneyManager.repository;

import in.moneymanager.MoneyManager.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity,Long> {

    // Using optional to avoid any null pointer exceptions if the email provided is not in the table

    // this function would query the table to find that email
    Optional<ProfileEntity> findByEmail(String email);

    // this function would query the table to find that activationToken
    Optional<ProfileEntity> findByActivationToken(String activationToken);

}


