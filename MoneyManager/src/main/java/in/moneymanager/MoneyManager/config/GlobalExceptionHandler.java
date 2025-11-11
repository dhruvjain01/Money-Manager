package in.moneymanager.MoneyManager.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,Object>> handleResponseStatusException(ResponseStatusException exception){
        Map<String, Object> body = new HashMap<>();
        body.put("status", exception.getStatusCode().value());
        body.put("error", exception.getReason());
        return new ResponseEntity<>(body, exception.getStatusCode());
    }
}
