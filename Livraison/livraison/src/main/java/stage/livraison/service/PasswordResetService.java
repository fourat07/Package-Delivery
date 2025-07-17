package stage.livraison.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import stage.livraison.entities.PasswordResetToken;
import stage.livraison.entities.User;
import stage.livraison.repositories.PasswordResetTokenRepository;

import java.time.LocalDateTime;
import java.util.UUID;
@Service
public class PasswordResetService {

    @Autowired
     PasswordResetTokenRepository passwordResetTokenRepository ;

    public String createPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);
        return token;
    }
}
