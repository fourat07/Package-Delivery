package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.Commentaire;
import stage.livraison.entities.Reclamation;
import stage.livraison.entities.User;
import stage.livraison.repositories.CommentaireRepository;
import stage.livraison.repositories.ReclamationRepository;
import stage.livraison.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/commentaire")
@RequiredArgsConstructor
public class CommentaireController {


    private final CommentaireRepository commentaireRepository;
    private final UserRepository userRepository;
    private final ReclamationRepository reclamationRepository;

    @PostMapping("/add/{reclamationId}/{userId}")
    public ResponseEntity<Commentaire> addComment(
            @PathVariable Long reclamationId,
            @PathVariable Long userId,
            @RequestBody Commentaire commentaire) {

        User auteur = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));



        commentaire.setAuteur(auteur);
        commentaire.setReclamation(reclamation);
        commentaire.setDateCreation(LocalDateTime.now());

        return ResponseEntity.ok(commentaireRepository.save(commentaire));
    }

    @GetMapping("/reclamation/{reclamationId}")
    public ResponseEntity<List<Commentaire>> getCommentaires(@PathVariable Long reclamationId) {
        return ResponseEntity.ok(
                commentaireRepository.findByReclamationId(reclamationId)
        );
    }

    @PutMapping("/{commentaireId}")
    public ResponseEntity<Commentaire> updateCommentaire(
            @PathVariable Long commentaireId,
            @RequestBody Commentaire updatedComment) {

        Commentaire commentaire = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));

        commentaire.setContenu(updatedComment.getContenu());
//        commentaire.setDateCreation(LocalDateTime.now()); // maj la date si tu veux

        commentaireRepository.save(commentaire);

        return ResponseEntity.ok(commentaire);
    }

}
