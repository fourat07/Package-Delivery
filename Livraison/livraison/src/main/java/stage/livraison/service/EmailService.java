package stage.livraison.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {  // Add resetLink as parameter
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");  // Explicit charset

            helper.setTo(to);
            helper.setSubject("Password Reset Request");

            // Use proper HTML structure with encoded URL
            String htmlContent = String.format(
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "  <meta charset=\"UTF-8\">" +
                            "  <style>" +
                            "    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');" +
                            "    body { font-family: 'Poppins', sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }" +
                            "    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
                            "    .header { background-color: #3498db; padding: 20px; text-align: center; }" +
                            "    .content { padding: 30px; }" +
                            "    h3 { color: #2c3e50; margin-top: 0; font-size: 22px; }" +
                            "    p { color: #4B5563; line-height: 1.6; font-size: 15px; }" +
                            "    .btn { background-color: #3498db; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin: 15px 0; font-size: 15px; }" +
                            "    .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; border-top: 1px solid #eaeaea; }" +
                            "    small { font-size: 13px; color: #6B7280; }" +
                            "    .expiry { color: #e74c3c; font-weight: 500; }" +
                            "  </style>" +
                            "</head>" +
                            "<body>" +
                            "  <div class=\"container\">" +
                            "    <div class=\"header\"></div>" +
                            "    <div class=\"content\">" +
                                    "      <h3>Réinitialisation de mot de passe</h3>" +
                                    "      <p>Bonjour,</p>" +
                                    "      <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour continuer :</p>" +
                                    "      <p><a href=\"%s\" class=\"btn\">Réinitialiser mon mot de passe</a></p>" +
                                    "      <p><small>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute sécurité.</small></p>" +
                                    "      <p class=\"expiry\">⏱ Ce lien expire dans 1 heures</p>" +
                                    "    </div>" +
                                    "    <div class=\"footer\">" +
                                    "      <p>© 2025 FastDelivery. Tous droits réservés.</p>" +
                                    "    </div>" +
                                    "  </div>" +
                                    "</body>" +
                                    "</html>",
                    resetLink
            );
            

            helper.setText(htmlContent, true);

            // Add plain text alternative
            String textContent = String.format(
                    "Password Reset Request\n\n" +
                            "Click here to reset your password:\n%s\n\n" +
                            "If you didn't request this, please ignore this email.\n" +
                            "This link expires in 24 hours.",
                    resetLink
            );

            helper.setText(textContent, htmlContent);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }


}
