package in.moneymanager.MoneyManager.util;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordValidator {

    // 8+ chars, 1 upper, 1 lower, 1 digit, 1 special char
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]{8,}$"
    );

    // list of very common weak passwords
    private static final String[] WEAK_PASSWORDS = {
            "password", "Password123", "12345678", "qwerty", "admin", "iloveyou"
    };

    public void validate(String password) {

        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must be 8+ chars, include uppercase, lowercase, number and special character"
            );
        }

        for (String weak : WEAK_PASSWORDS) {
            if (password.equalsIgnoreCase(weak)) {
                throw new IllegalArgumentException("Password is too weak, choose a stronger password");
            }
        }
    }
}
