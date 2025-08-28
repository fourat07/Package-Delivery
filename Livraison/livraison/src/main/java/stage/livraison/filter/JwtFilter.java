package stage.livraison.filter;



import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import stage.livraison.configuration.JwtUtils;
import stage.livraison.service.CustomUserDetailsService;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtils jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/auth");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        System.out.println("🔍 JWT Filter processing: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("⚠️ No valid Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(jwt);
            String role = jwtService.extractRole(jwt);
            if (username == null || role == null) {
                System.err.println("❌ Invalid JWT: username or role is null");
                filterChain.doFilter(request, response);
                return;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.validateToken(jwt, username)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null,
                                Collections.singletonList(new SimpleGrantedAuthority(role)));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ Authenticated user: " + username + ", Role: " + role);
            } else {
                System.err.println("❌ Invalid JWT token");
            }
        } catch (ExpiredJwtException e) {
            System.err.println("❌ JWT expired: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("❌ Malformed JWT: " + e.getMessage());
        } catch (SignatureException e) {
            System.err.println("❌ Invalid JWT signature: " + e.getMessage());
        } catch (UsernameNotFoundException e) {
            System.err.println("❌ User not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ JWT validation error: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}