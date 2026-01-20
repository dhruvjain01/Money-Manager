package in.moneymanager.MoneyManager.security;

import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.repository.ProfileRepository;
import in.moneymanager.MoneyManager.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ProfileRepository profileRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                String userId = jwtUtil.extractUserId(token);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    ProfileEntity user = profileRepository
                            .findById(Long.valueOf(userId))
                            .orElse(null);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    List.of()
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            } catch (Exception ignored) {}
        }
        filterChain.doFilter(request, response);
    }
}