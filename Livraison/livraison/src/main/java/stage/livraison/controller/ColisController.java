package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.*;
import stage.livraison.repositories.*;
import stage.livraison.service.ColisServiceImpl;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/colis")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j

public class ColisController {




    @Autowired
    private ColisRepository colisRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ColisServiceImpl colisService;


    @Autowired
    private final HistoriqueStatutRepository historiqueRepository;

    @Value("${app.frontend.url}") // ex: https://front.yourapp.com
    private String publicBaseUrl;


    @PostMapping("/create")
    public Colis createColis(@RequestBody Colis colis, Principal authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        colis.setUser(user);
        // Génération de code-barres automatique
        colis.setCodeBarre(UUID.randomUUID().toString());
        colis.setStatut_colis(StatutColis.EN_ATTENTE); // par défaut
        return colisRepository.save(colis);
    }

    @GetMapping("/getAllColis")
    public List<Colis> getAllColis(Principal authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        return colisService.getColisForUser(user);
    }

    @GetMapping("/getColis/{id}")
    public ResponseEntity<Colis> getColisById(@PathVariable Long id) {
        return colisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/updateColis/{id}")
    public ResponseEntity<Colis> updateColis(@PathVariable Long id, @RequestBody Colis updated) {
        return colisRepository.findById(id).map(existing -> {
                    if (updated.getAdresse() != null) existing.setAdresse(updated.getAdresse());
                    if (updated.getTelephone() != null) existing.setTelephone(updated.getTelephone());
                    if (updated.getPrix() != 0) existing.setPrix(updated.getPrix()); // float default is 0.0
                    if (updated.getPaiement() != null) existing.setPaiement(updated.getPaiement());
                    if (updated.getNbArticle() != 0) existing.setNbArticle(updated.getNbArticle());
                    if (updated.getRemarque() != null) existing.setRemarque(updated.getRemarque());
                    return ResponseEntity.ok(colisRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/deleteColis/{id}")
    public ResponseEntity<Void> deleteColis(@PathVariable Long id) {
        if (colisRepository.existsById(id)) {
            colisRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }



/*    @GetMapping("/historique/export")
    public ResponseEntity<byte[]> exportHistorique() {
        List<HistoriqueColis> historiques = historiqueRepository.findAll();
        byte[] csv = historiqueService.exportHistoriqueToCsv(historiques);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=historique.csv");
        headers.set(HttpHeaders.CONTENT_TYPE, "text/csv");

        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }*/
/*    @GetMapping("/historique/all")
    public List<HistoriqueColis>getAllHistorique(Principal authentication){
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);


        return colisService.getHistoriqueForUser(user);
    }*/

    // changer le statut d’un colis
    @PatchMapping("/{colisId}/statut")
    public Colis changerStatut(@PathVariable Long colisId,
                               @RequestParam StatutColis nouveauStatut,
                               Principal principal,
                               @RequestParam(required = false) String commentaire) {
        String username = principal != null ? principal.getName() : null;
        return colisService.changerStatut(colisId, nouveauStatut, username,commentaire);
    }

    // récupérer l’historique d’un colis
    @GetMapping("/{colisId}/historique")
    public List<HistoriqueStatut> getHistoriqueColis(@PathVariable Long colisId) {
        return historiqueRepository.findByColisIdOrderByDateChangementAsc(colisId)
                .stream()
                .map(h -> (HistoriqueStatut) Map.of(
                        "ancienStatut", h.getAncienStatut(),
                        "nouveauStatut", h.getNouveauStatut(),
                        "dateChangement", h.getDateChangement(),
                        "changedBy", h.getUser() != null ? h.getUser().getUsername() : null,
                        "commentaire", h.getCommentaire()
                ))
                .toList();
    }

    // récupérer l’historique de tous les colis d’une livraison
    @GetMapping("/livraison/{livraisonId}/historique")
    public List<HistoriqueStatut> getHistoriqueLivraison(@PathVariable Long livraisonId) {
        return colisService.getHistoriqueLivraison(livraisonId);
    }

}


