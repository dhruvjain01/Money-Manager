package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.dto.AuthDTO;
import in.moneymanager.MoneyManager.dto.ProfileDTO;
import in.moneymanager.MoneyManager.entity.RefreshToken;
import in.moneymanager.MoneyManager.service.ProfileService;
import in.moneymanager.MoneyManager.service.RefreshTokenService;
import in.moneymanager.MoneyManager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

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

    @GetMapping("/test")
    public String test(){
        return "Ab bol na mc";
    }
}
