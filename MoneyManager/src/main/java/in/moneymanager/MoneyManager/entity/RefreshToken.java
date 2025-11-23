package in.moneymanager.MoneyManager.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // the actual refresh token string (random UUID)
    @Column(nullable = false, unique = true)
    private String token;

    // family id groups tokens that belong to same login session/device
    @Column(name = "family_id", nullable = false)
    private String familyId;

    // absolute expiry for the family/session (do NOT extend on rotation)
    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;

    // single-use flag: true when token was used / revoked
    @Column(nullable = false)
    private boolean revoked = false;

    // token string of the token which replaced this one (for audit)
    @Column(name = "replaced_by")
    private String replacedBy;
}
