package in.moneymanager.MoneyManager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String password;
    private String profileImageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
