package in.moneymanager.MoneyManager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${brevo.sender.email}")
    private String fromEmail;

    @Value("${brevo.sender.name:Money Manager}")
    private String fromName;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private static final String BREVO_SEND_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    public void sendEmail(String to, String subject, String body){
        try{
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", body
            );
            sendViaBrevo(payload);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to send email");
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", body,
                    "attachment", List.of(
                            Map.of(
                                    "name", filename,
                                    "content", Base64.getEncoder().encodeToString(attachment)
                            )
                    )
            );
            sendViaBrevo(payload);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to send email with attachment");
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {

        try{
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", fromName, "email", fromEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "htmlContent", htmlContent
            );
            sendViaBrevo(payload);
        }
        catch (Exception exp){
            throw new RuntimeException("Failed to send email");
        }
    }

    private void sendViaBrevo(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(BREVO_SEND_EMAIL_ENDPOINT, request, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Brevo API request failed");
        }
    }
}
