package stage.livraison.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import stage.livraison.entities.ChangePasswordRequest;
import stage.livraison.entities.Role;
import stage.livraison.entities.User;
import stage.livraison.repositories.UserRepository;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

  /*  private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public void changePassword( ChangePasswordRequest request, User user) {
        //User user = userRepository.findByUsername(request.getUsername());
         if (user.getUsername().equals(userRepository.findByUsername(request.getUsername()))) {

             if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                 throw new RuntimeException("Old password is incorrect");
             }

             user.setPassword(passwordEncoder.encode(request.getNewPassword()));
             userRepository.save(user);
         }

    }*/


    public String storeUserPhoto(String username, MultipartFile file) throws IOException {
        User user = userRepository.findByUsername(username);

        // Supprimer l'ancienne photo
        if (user.getPhoto() != null) {
            String oldPhotoPath = "uploads/profile_photos/" + user.getPhoto();
            File oldFile = new File(oldPhotoPath);
          /*  if (oldFile.exists()) {
                oldFile.delete();
            }*/
        }

        // Créer le dossier si besoin
        String uploadDir = "uploads/profile_photos/";
        Files.createDirectories(Paths.get(uploadDir));

        // Nom unique
        String filename = file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Mettre à jour l'utilisateur
        user.setPhoto(filename);
        userRepository.save(user);

        return filename;
    }





    public List<User> getAllLivreurs() {
        return userRepository.findByRole(Role.ROLE_LIVREUR);
    }


}





