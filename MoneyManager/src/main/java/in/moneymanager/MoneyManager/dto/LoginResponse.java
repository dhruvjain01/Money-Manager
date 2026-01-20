package in.moneymanager.MoneyManager.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String userId;
    private String email;
    private String token;
}
