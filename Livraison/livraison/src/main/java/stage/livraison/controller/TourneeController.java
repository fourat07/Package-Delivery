package stage.livraison.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.*;
import stage.livraison.repositories.LivraisonRepository;
import stage.livraison.repositories.TourneeRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.TourneeServiceImpl;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/tournee")
@AllArgsConstructor
public class TourneeController {

    private final TourneeServiceImpl tourneeService;
    private final TourneeRepository tourneeRepository;
    private final UserRepository userRepository;
    private final LivraisonRepository livraisonRepository;



    @PostMapping("/create")
    public ResponseEntity<Tournee> createTournee(
            @RequestParam Long livreurId,
            @RequestBody Map<String, Object> payload) {

        User livreur = userRepository.findById(livreurId)
                .orElseThrow(() -> new RuntimeException("Livreur introuvable"));

        livreur.setDisponible(false);
        userRepository.save(livreur);

        // Récupérer livraisonIds en tant que liste générique
        List<?> livraisonIdsRaw = (List<?>) payload.get("livraisonId");

        if (livraisonIdsRaw == null || livraisonIdsRaw.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        // Convertir en List<Long>
        List<Long> livraisonIds = livraisonIdsRaw.stream()
                .map(Object::toString)   // convertir chaque élément en String
                .map(Long::valueOf)      // parser en Long
                .toList();

        List<Livraison> livraisons = livraisonRepository.findAllById(livraisonIds);
        if (livraisons.isEmpty()) return ResponseEntity.badRequest().build();

        // Parse datePickup
        String datePickupStr = (String) payload.get("datePickup");
        LocalDateTime datePickup = LocalDateTime.parse(datePickupStr);

        Tournee tournee = tourneeService.createTournee(livreur, livraisons, datePickup);
        tournee.setStatus(TourneeStatus.EN_ATTENTE);
        tournee = tourneeRepository.save(tournee);

        return ResponseEntity.ok(tournee);
    }



    @GetMapping("/livreur/{id}")
    public List<Tournee> getTodayTournees(@PathVariable Long id, @RequestParam(required = false) String date) {
        User livreur = new User();
        livreur.setIdUser(id);

        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        return tourneeService.getTourneesForLivreur(livreur, d);
    }

    @PutMapping("/{id}/start")
    public Tournee startTournee(@PathVariable Long id) {
        return tourneeService.startTournee(id);
    }

    @PutMapping("/{id}/complete")
    public Tournee completeTournee(@PathVariable Long id) {
        return tourneeService.completeTournee(id);
    }

    @GetMapping("/historique/livreur/{id}")
    public List<Tournee> historique(@PathVariable Long id) {
        User livreur = new User();
        livreur.setIdUser(id);
        return tourneeService.getHistorique(livreur);
    }


    @GetMapping
    public List<Tournee> getAllTournees(Principal authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        return tourneeService.getTourneeForUser(user) ;
    }

    @GetMapping("/{id}")
    public Tournee getTourneeById(@PathVariable Long id) {
        Tournee tournee = tourneeRepository.getById(id);
        // Forcer le chargement des colis
        tournee.getLivraisons().forEach(l -> l.getColisList().size());
        return tournee;
    }



    @GetMapping("/{id}/details")
    public Map<String, Object> tourneeDetails(@PathVariable Long id) {
        Tournee t = tourneeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournée introuvable"));

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> livraisonsList = new ArrayList<>();

        for (Livraison livraison : t.getLivraisons()) {
            Map<String, Object> livraisonData = new HashMap<>();
            livraisonData.put("livraisonId", livraison.getId());
            livraisonData.put("reference", livraison.getReference());
            livraisonData.put("status", livraison.getStatus());
            livraisonData.put("dateCreation", livraison.getDateCreation());

            // --- Liste de colis au lieu d'un Map ---
            List<Map<String, Object>> colisList = new ArrayList<>();
            for (Colis colis : livraison.getColisList()) {
                Map<String, Object> colisData = new HashMap<>();
                colisData.put("colisId",colis.getId());
                colisData.put("codeBarre", colis.getCodeBarre());
                colisData.put("adresse", colis.getAdresse());
                colisData.put("telephone", colis.getTelephone());
                colisData.put("prix", colis.getPrix());
                colisData.put("paiement", colis.getPaiement());
                colisData.put("statut_colis", colis.getStatut_colis());
                colisData.put("user", colis.getUser());
                colisData.put("frais_retour", colis.getUser() != null ? colis.getUser().getFrais_retour() : 0);
                colisList.add(colisData);
            }

            livraisonData.put("colisList", colisList);
            livraisonData.put("colisCount", colisList.size()); // nombre de colis pour cette livraison
            livraisonsList.add(livraisonData);
        }

        response.put("tourneeId", t.getId());
        response.put("date", t.getDate());
        response.put("livreur", t.getLivreur());
        response.put("status", t.getStatus());
        response.put("livraisons", livraisonsList);
        response.put("livraisonsCount", livraisonsList.size()); // nombre total de livraisons

        return response;
    }





}
