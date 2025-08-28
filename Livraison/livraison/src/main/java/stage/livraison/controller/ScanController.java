package stage.livraison.controller;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.*;
import stage.livraison.repositories.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scan")
@RequiredArgsConstructor
public class ScanController {

    private final ColisRepository colisRepo;
    private final LivraisonRepository livraisonRepo;
    private final UserRepository userRepos;
    private final HistoriqueStatutRepository historiqueRepository;
    private final TourneeRepository tourneeRepository;


    // DTO simplifié
    record ColisDto(Long id, String code, StatutColis statut) {}

    /** 1) Colis individuel */
    @GetMapping("/colis")
    public ResponseEntity<?> getColis(@RequestParam Long colisId) {
        Colis c = colisRepo.findById(colisId).orElseThrow();
        return ResponseEntity.ok(new ColisDto(c.getId(), c.getCodeBarre(), c.getStatut_colis()));
    }

    @PatchMapping("/colis/{colisId}/statut")
    public ResponseEntity<?> updateColisStatus(@PathVariable Long colisId,
                                               @RequestParam StatutColis statut,
                                               @RequestParam(required = false) String commentaire,
                                               Principal principal) {
        Colis c = colisRepo.findById(colisId).orElseThrow();

        // 1. Sauvegarder l'ancien statut
        StatutColis ancien = c.getStatut_colis();

        // 2. Mettre à jour le statut
        c.setStatut_colis(statut);
        colisRepo.save(c);

        // 3. Créer un historique
        HistoriqueStatut hist = new HistoriqueStatut();
        hist.setId(colisId);
        hist.setColis((Colis) c);
        hist.setAncienStatut(ancien);
        hist.setNouveauStatut(statut);
        hist.setDateChangement(LocalDateTime.now());

        if (principal != null) {
            User user = userRepos.findByUsername(principal.getName());
            //.orElse(null);
            hist.setUser(user);
        }

        hist.setCommentaire(commentaire);
        historiqueRepository.save(hist);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/livraison")
    public ResponseEntity<?> getLivraison(@RequestParam Long livraisonId) {
        Livraison l = livraisonRepo.findById(livraisonId).orElseThrow();
        List<ColisDto> list = l.getColisList().stream()
                .map(c -> new ColisDto(c.getId(), c.getCodeBarre(), c.getStatut_colis()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @Transactional
    @PatchMapping("/livraison/{livraisonId}/colis/{colisId}/statut")
    public ResponseEntity<?> updateColisFromLivraison(
            @PathVariable Long livraisonId,
            @PathVariable Long colisId,
            @RequestParam("statut") StatutColis nouveauStatut,
            @RequestParam(name = "commentaire", required = false) String commentaire,
            Principal principal) {

        // 1️⃣ Récupérer la livraison et le colis
        Livraison livraison = livraisonRepo.findById(livraisonId)
                .orElseThrow(() -> new EntityNotFoundException("Livraison not found"));

        Colis colis = livraison.getColisList().stream()
                .filter(c -> c.getId().equals(colisId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Colis not found in this livraison"));

        // 2️⃣ Vérifier si le statut a changé
        if (colis.getStatut_colis() == nouveauStatut) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Status unchanged");
            return ResponseEntity.ok(response);
        }

        // 3️⃣ Mettre à jour le colis
        StatutColis ancienStatut = colis.getStatut_colis();
        colis.setStatut_colis(nouveauStatut);

        HistoriqueStatut historique = new HistoriqueStatut();
        historique.setColis(colis);
        historique.setAncienStatut(ancienStatut);
        historique.setNouveauStatut(nouveauStatut);
        historique.setDateChangement(LocalDateTime.now());
        historique.setCommentaire(commentaire);

        if (principal != null) {
            User user = userRepos.findByUsername(principal.getName());
            historique.setUser(user);
        }

        colis.getHistorique_Colis().add(historique);
        colisRepo.save(colis);

        // 4️⃣ Mettre à jour le statut de la livraison
        boolean allLivre = livraison.getColisList().stream()
                .allMatch(c -> c.getStatut_colis() == StatutColis.LIVRE);
        boolean allEnAttente = livraison.getColisList().stream()
                .allMatch(c -> c.getStatut_colis() == StatutColis.EN_ATTENTE);

        if (allLivre) {
            livraison.setStatus(LivraisonStatus.LIVREE);
        } else if (allEnAttente) {
            livraison.setStatus(LivraisonStatus.EN_ATTENTE);
        } else {
            livraison.setStatus(LivraisonStatus.EN_COURS);
        }

        // ✅ Sauvegarde + flush pour garantir que Hibernate connaît le nouvel état
        livraisonRepo.saveAndFlush(livraison);

        // 5️⃣ Mettre à jour le statut de la tournée
        Tournee tournee = livraison.getTournee();
        if (tournee != null) {
            boolean allLivree = tournee.getLivraisons().stream()
                    .allMatch(l -> l.getStatus() == LivraisonStatus.LIVREE);
            boolean allEnAttenteTournee = tournee.getLivraisons().stream()
                    .allMatch(l -> l.getStatus() == LivraisonStatus.EN_ATTENTE);

            if (allLivree) {
                tournee.setStatus(TourneeStatus.LIVREE);
                // ✅ Si toute la tournée est livrée → rendre le livreur dispo
                if (tournee.getLivreur() != null) {
                    User livreur = tournee.getLivreur();
                    livreur.setDisponible(true);
                    userRepos.save(livreur); // maj de la dispo
                }
            } else if (allEnAttenteTournee) {
                tournee.setStatus(TourneeStatus.EN_ATTENTE);
            } else {
                tournee.setStatus(TourneeStatus.EN_COURS);
            }

            tourneeRepository.saveAndFlush(tournee); // ✅ flush aussi
        }

        return ResponseEntity.ok().build();
    }


}
