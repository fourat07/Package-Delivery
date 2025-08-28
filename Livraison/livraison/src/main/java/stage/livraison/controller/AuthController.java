package stage.livraison.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

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
import org.springframework.web.multipart.MultipartFile;
import stage.livraison.configuration.JwtUtils;
import stage.livraison.entities.*;
import stage.livraison.exception.ExpiredTokenException;
import stage.livraison.exception.InvalidTokenException;
import stage.livraison.repositories.PasswordResetTokenRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.EmailService;
import stage.livraison.service.PasswordResetService;
import stage.livraison.service.UserServiceImpl;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

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
    private final UserServiceImpl userService;



    /*@PostMapping("/register")
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
    }*/
/*    @GetMapping("/test")
    public ResponseEntity<String> test (){
        System.out.println("✅ Méthode test appelée !");
        return ResponseEntity.ok("Hello from Spring Boot");

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
            User userEntity = userRepository.findByUsername(userDetails.getUsername());

            // ✅ Generate token with username and role
            String token = jwtUtils.generateToken(
                    userDetails.getUsername(),
                    userDetails.getAuthorities().iterator().next().getAuthority(),
                    userEntity.getIdUser(),
                     userEntity.getAdresse(),
                     userEntity.getEmail(),
                     userEntity.getPhoneNumber(),
                     userEntity.getFrais_retour()   ,
                    userEntity.getPhoto()// e.g., "ROLE_ADMIN"
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(Map.of(
                            "token", token,
                            "type", "Bearer",
                            "role", userDetails.getAuthorities().iterator().next().getAuthority(), // optional: return it to frontend
                            "idUser",userEntity.getIdUser()
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




    /*@PostMapping("/upload-photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request,
            Principal principal) {

        // DETAILED DEBUGGING - Add this to see what's happening
        System.out.println("=== UPLOAD PHOTO DEBUG ===");
        System.out.println("🔍 Authorization header: " + request.getHeader("Authorization"));
        System.out.println("🔍 All headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println("   " + headerName + ": " + request.getHeader(headerName));
        }

        System.out.println("🔍 Principal: " + principal);
        System.out.println("🔍 Principal class: " + (principal != null ? principal.getClass().getName() : "null"));
        System.out.println("🔍 Principal name: " + (principal != null ? principal.getName() : "null"));

        // Check SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔍 SecurityContext authentication: " + auth);
        System.out.println("🔍 Auth class: " + (auth != null ? auth.getClass().getName() : "null"));
        System.out.println("🔍 Auth name: " + (auth != null ? auth.getName() : "null"));
        System.out.println("🔍 Auth authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        System.out.println("🔍 Auth authenticated: " + (auth != null ? auth.isAuthenticated() : "false"));

        // File info
        System.out.println("🔍 File name: " + file.getOriginalFilename());
        System.out.println("🔍 File size: " + file.getSize());
        System.out.println("🔍 Content type: " + file.getContentType());

        System.out.println("=== END DEBUG ===");

        if (principal == null) {
            System.err.println("❌ Principal is null - authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        try {
            String username = principal.getName();
            String photoUrl = userService.storeUserPhoto(username, file);
            System.out.println("✅ Photo uploaded successfully: " + photoUrl);
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
        } catch (Exception e) {
            System.err.println("❌ Error uploading photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        }
    }*/

    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file, Principal principal) {


        try {

            String username = principal.getName();
            log.info("📷 Photo upload for username: {}", username);

            String photoUrl = userService.storeUserPhoto(username, file);

            System.out.println(photoUrl);

            Map<String, String> response = new HashMap<>();
            response.put("photoUrl", photoUrl);


            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload photo"));
        }
    }




}

