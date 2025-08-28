package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.*;
import stage.livraison.repositories.ReclamationRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.ReclamationServiceImpl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/reclamation")
@RequiredArgsConstructor
public class ReclamationController {


    private final ReclamationServiceImpl reclamationService;
    private final ReclamationRepository reclamationRepository;
    private final UserRepository userRepository;

    @PostMapping("/create/{clientId}")
    public ResponseEntity<Reclamation> createReclamation(
            @PathVariable Long clientId,
            @RequestBody Reclamation reclamation) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        reclamation.setClient(client);
        reclamation.setDateCreation(LocalDateTime.now());
        reclamation.setStatut(ReclamationStatut.EN_ATTENTE);
        reclamationRepository.save(reclamation);

        return ResponseEntity.ok(reclamation);
    }


    @GetMapping
    public ResponseEntity<List<Reclamation>> getAll(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
                //.orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Reclamation> result;

        if ((user.getRole() == Role.ROLE_ADMIN)) {
            // ✅ Admin : toutes les réclamations
            result = reclamationService.getAllReclamations();

        } else if (user.getRole() == Role.ROLE_AGENT){
            // ✅ Agent : seulement celles qui lui sont assignées
            result = reclamationService.getReclamationsByAgent(user.getIdUser());

        } else if (user.getRole() == Role.ROLE_EXPEDITEUR) {
            // ✅ Expéditeur : seulement celles créées par lui
            result = reclamationService.getReclamationsByClient(user.getIdUser());

        } else {
            result = List.of(); // aucun accès sinon
        }

        return ResponseEntity.ok(result);
    }


    @PutMapping("/{id}/assign/{agentId}")
    public ResponseEntity<Reclamation> assignAgent(@PathVariable Long id, @PathVariable Long agentId) {
        return ResponseEntity.ok(reclamationService.assignAgent(id, agentId));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Reclamation> updateStatut(@PathVariable Long id, @RequestParam ReclamationStatut statut) {
        return ResponseEntity.ok(reclamationService.updateStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reclamationService.deleteReclamation(id);
        return ResponseEntity.noContent().build();
    }


 /*   @PutMapping("/{id}/commentaire")
    public ResponseEntity<Reclamation> addComment(
            @PathVariable Long id,
            @RequestParam String commentaire) {
        return ResponseEntity.ok(reclamationService.addComment(id, commentaire));
    }*/
    @PostMapping("/{id}/commentaires")
    public ResponseEntity<Reclamation> addComment(
            @PathVariable Long id,
            @RequestBody Commentaire commentaire,
            @AuthenticationPrincipal User user) {

        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));

        commentaire.setAuteur(user);
        commentaire.setReclamation(reclamation);
        commentaire.setDateCreation(LocalDateTime.now());

        reclamation.getCommentaires().add(commentaire);
        reclamationRepository.save(reclamation);

        return ResponseEntity.ok(reclamation);
    }
    @GetMapping("/{id}/details")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable avec id " + id));

        return ResponseEntity.ok(reclamation);
    }
    @GetMapping("/agents/{agentId}/count-actives")
    public long getActiveReclamationsCount(@PathVariable Long agentId) {
        return reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                agentId,
                ReclamationStatut.EN_ATTENTE
        );
    }



}
