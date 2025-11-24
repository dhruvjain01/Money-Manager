package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.dto.AuthDTO;
import in.moneymanager.MoneyManager.dto.ProfileDTO;
import in.moneymanager.MoneyManager.entity.PasswordResetToken;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.entity.RefreshToken;
import in.moneymanager.MoneyManager.repository.ProfileRepository;
import in.moneymanager.MoneyManager.service.EmailService;
import in.moneymanager.MoneyManager.service.PasswordResetService;
import in.moneymanager.MoneyManager.service.ProfileService;
import in.moneymanager.MoneyManager.service.RefreshTokenService;
import in.moneymanager.MoneyManager.util.JwtUtil;
import in.moneymanager.MoneyManager.util.PasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;
    private final ProfileRepository profileRepository;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;

    @Value("${money.manager.frontend.url}")
    String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<ProfileDTO> registerProfile(@RequestBody ProfileDTO profileDTO){
        ProfileDTO registeredProfile = profileService.registerProfile(profileDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredProfile);
    }

    @GetMapping("/activate")
    public ResponseEntity<String> activateProfile(@RequestParam String token){
        Boolean isActivated = profileService.activateProfile(token);
        if(isActivated){
            return ResponseEntity.status(HttpStatus.OK).body("Successfully activated profile!");
        }
        else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ERROR : Activation token not found or already used");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody AuthDTO authDTO){
        try{
            Map<String,Object> response = profileService.authenticateAndGenerateToken(authDTO);
            if(!profileService.isAccountActive(authDTO.getEmail())){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message","Account is not active please activate your account first"
                ));
            }
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
        catch(Exception exception){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message",exception.getMessage()
            ));
        }
    }

    @PostMapping("/refresh")
    public Map<String, Object> refreshAccessToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Missing refreshToken in request");
        }

        try {
            RefreshToken newToken = refreshTokenService.rotateRefreshToken(refreshToken);
            String newAccessToken = jwtUtil.generateToken(newToken.getProfile().getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newToken.getToken());
            return response;
        } catch (RuntimeException ex) {
            // Let GlobalExceptionHandler map the runtime exception to 401
            throw ex;
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> body) {

        String email = body.get("email");

        ProfileEntity user = profileRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not registered"));

        PasswordResetToken token = passwordResetService.createResetToken(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token.getToken();

        String template = null;
        try {
            template = Files.readString(
                    Paths.get("src/main/resources/html/reset-password.html")
            );
        } catch (IOException e) {
            System.out.println("Exception " + e);
            throw new RuntimeException(e);
        }

        String html = template.replace("{{RESET_LINK}}", resetLink)
                .replace("${year}", String.valueOf(LocalDate.now().getYear()));

        emailService.sendHtmlEmail(
                user.getEmail(),
                "Reset your Money Manager password",
                html
        );

        return ResponseEntity.status(HttpStatus.OK).body("Password reset link sent to email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> body) {

        String token = body.get("token");
        String newPassword = body.get("newPassword");

        passwordValidator.validate(newPassword);

        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password cannot be empty");
        }

        PasswordResetToken prt = passwordResetService.validateToken(token);

        ProfileEntity user = prt.getProfile();
        user.setPassword(passwordEncoder.encode(newPassword));
        profileRepository.save(user);

        // Mark token as used
        passwordResetService.markUsed(prt);

        return ResponseEntity.status(HttpStatus.OK).body("Password updated successfully");
    }

    // validate-reset-token - used by frontend to check token validity without consuming it
    @PostMapping("/validate-reset-token")
    public ResponseEntity<String> validateResetToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        // validateToken() performs checks but DOES NOT mark used
        passwordResetService.validateToken(token);
        return ResponseEntity.ok("valid");
    }

    @GetMapping("/test")
    public String test(){
        return "Ab bol na mc";
    }
}
