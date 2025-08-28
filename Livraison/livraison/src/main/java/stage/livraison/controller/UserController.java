package stage.livraison.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import stage.livraison.entities.ChangePasswordRequest;
import stage.livraison.entities.ReclamationStatut;
import stage.livraison.entities.Role;
import stage.livraison.entities.User;
import stage.livraison.repositories.ReclamationRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.PasswordResetService;
import stage.livraison.service.UserServiceImpl;

import javax.print.attribute.standard.Media;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserServiceImpl userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final ReclamationRepository reclamationRepository;



    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestParam("file") MultipartFile file, Principal principal) {

        try {
            String username = principal.getName();
            String filename = userService.storeUserPhoto(username, file);

            // Construire l’URL complète
            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            String photoUrl =  filename;

            return ResponseEntity.ok(Map.of("photoUrl", filename));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload photo"));
        }
    }



    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username is already in use");
        }

        // Encoder le mot de passe et le mettre dans l'objet User
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        //user.setRole("ROLE_LIVREUR");  // or however your role property is named
        user.setDisponible(true);
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }



    @GetMapping("/uploads/profile_photos/{filename:.+}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) throws IOException {
        // 🟢 Décodage du nom de fichier
        String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

        Path uploadDir = Paths.get("uploads/profile_photos");
        Path filePath = uploadDir.resolve(decodedFilename);

        log.info("file path is: {}", filename);


        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());

        String contentType = Files.probeContentType(filePath);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .body(resource);

    }

    // ✅ Get all users with role 'LIVREUR'
    @GetMapping("/livreurs")
    public List<User> getLivreurs() {
        return userService.getAllLivreurs();
    }

    @GetMapping("/agents/disponibles")
    public List<User> getAgentsDisponibles() {
        List<User> agents = userRepository.findByRoleAndDisponible(Role.ROLE_AGENT, true);

        for (User agent : agents) {
            long count = reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                    agent.getIdUser(),
                    ReclamationStatut.EN_ATTENTE
            );
            agent.setNbReclamationsAssignees(count);
        }

        return agents;
    }
    @GetMapping("/getAllUsers")
    public List<User>getAllUsers (){
        return userRepository.findAll();
    }


    @PutMapping("/updateuser/{idUser}")
    public ResponseEntity<User> updateUser(@PathVariable("idUser") Long idUser, @RequestBody User updatedUser) {
        User existingUser = userRepository.findById(idUser).get();

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setAdresse(updatedUser.getAdresse());
        existingUser.setRole(updatedUser.getRole());
        existingUser.setFrais_retour(updatedUser.getFrais_retour());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        // Ajoute les autres champs à mettre à jour selon ta classe User

        User savedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(savedUser);

    }


    @DeleteMapping("/deleteuser/{idUser}")
    public void deleteUser(@PathVariable("idUser") Long id){

        userRepository.deleteById(id);

    }

    @GetMapping("/userdetails/{id}")
    public User getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id).get();
        return user;

    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        try {
            // Récupérer l'utilisateur authentifié
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Trouver l'utilisateur dans la base de données
            User user = userRepository.findByUsername(changePasswordRequest.getUsername());
            //.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Vérifier l'ancien mot de passe
            if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
                return ResponseEntity.ok(Map.of("message","Ancien mot de passe incorrect"));
            }

            // Vérifier que le nouveau mot de passe est différent de l'ancien
            if (passwordEncoder.matches(changePasswordRequest.getNewPassword(), user.getPassword())) {
                return ResponseEntity.ok(Map.of("message","Password changed successfully!"));
            }

            // Mettre à jour le mot de passe
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message","Mot de passe mis à jour avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

   /* @GetMapping("/agents/disponibles")
    public List<User> getAgentsDisponibles() {
        return userRepository.findByRoleAndDisponible(Role.ROLE_AGENT, true);
    }*/




}
