package stage.livraison.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import stage.livraison.configuration.JwtUtils;
import stage.livraison.entities.ForgotPasswordRequest;
import stage.livraison.entities.PasswordResetToken;
import stage.livraison.entities.ResetPasswordRequest;
import stage.livraison.entities.User;
import stage.livraison.exception.ExpiredTokenException;
import stage.livraison.exception.InvalidTokenException;
import stage.livraison.repositories.PasswordResetTokenRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.EmailService;
import stage.livraison.service.PasswordResetService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;



    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username is already in use");
        }

        // Encoder le mot de passe et le mettre dans l'objet User
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        //user.setRole("ROLE_LIVREUR");  // or however your role property is named
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
   /* @GetMapping("/test")
    public void test (){
        System.out.println("hello");

    }*/

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // ✅ Now get the UserDetails from the authentication result
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // ✅ Generate token with username and role
            String token = jwtUtils.generateToken(
                    userDetails.getUsername(),
                    userDetails.getAuthorities().iterator().next().getAuthority() // e.g., "ROLE_ADMIN"
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(Map.of(
                            "token", token,
                            "type", "Bearer",
                            "role", userDetails.getAuthorities().iterator().next().getAuthority() // optional: return it to frontend
                    ));
        } catch (AuthenticationException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // 1. Find user with proper error handling
        User user = userRepository.findByEmail(request.getEmail());
                //.orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        // 2. Generate token
        String token = passwordResetService.createPasswordResetToken(user);
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        // 3. Construct reset link (corrected version)
       String resetLink = "http://localhost:4200/user/reset-password?token="+encodedToken;
        log.info("Generated reset link: {}", resetLink);
        /*String resetLink = UriComponentsBuilder.fromHttpUrl("http://localhost:4200")
                .path("/user/reset-password")
                .queryParam("token", token)
                .toUriString();*/
        // 4. Send email
        emailService.sendPasswordResetEmail(
                user.getEmail(),resetLink);

        return ResponseEntity.ok(Map.of(
                "message", "Password reset link sent to your email"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // 1. Get the token from Optional
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid password reset token"));



        // 2. Now you can safely access resetToken methods
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new ExpiredTokenException("Password reset token has expired");
        }

        // 3. Get user and update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Delete the used token
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of(
                "message", "Password successfully reset"
        ));
    }
}