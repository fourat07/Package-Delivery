package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import stage.livraison.entities.*;
import stage.livraison.repositories.*;
import stage.livraison.service.DashboardService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ColisRepository colisRepository;
    private final LivraisonRepository livraisonRepository;
    private final UserRepository userRepository;
    private final ReclamationRepository reclamationRepository;;
    private final TourneeRepository tourneeRepository;
    private final HistoriqueStatutRepository historiqueStatutRepository;


    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();

        // --- Totaux ---
        stats.put("totalColis", colisRepository.count());
        stats.put("totalTournees", tourneeRepository.count());
        stats.put("totalLivraisons", livraisonRepository.count());
        stats.put("totalLivreurs", userRepository.countByRole(Role.ROLE_LIVREUR));

        // --- Colis ---
        stats.put("colis_enAttente", colisRepository.countByStatutColis(StatutColis.EN_ATTENTE));
        stats.put("colis_auDepot", colisRepository.countByStatutColis(StatutColis.AU_DEPOT));
        stats.put("colis_enCours", colisRepository.countByStatutColis(StatutColis.EN_COURS));
        stats.put("colis_livres", colisRepository.countByStatutColis(StatutColis.LIVRE));
        stats.put("colis_livresPayes", colisRepository.countByStatutColis(StatutColis.LIVRE_PAYE));
        stats.put("colis_retours", colisRepository.countByStatutColis(StatutColis.RETOUR));
        stats.put("colis_retoursPayes", colisRepository.countByStatutColis(StatutColis.RETOUR_PAYE));
        stats.put("colis_echanges", colisRepository.countByStatutColis(StatutColis.ECHANGE));

        // --- Tournées ---
        stats.put("tournees_enAttente", tourneeRepository.countBystatus(TourneeStatus.EN_ATTENTE));
        stats.put("tournees_enCours", tourneeRepository.countBystatus(TourneeStatus.EN_COURS));
        stats.put("tournees_terminees", tourneeRepository.countBystatus(TourneeStatus.LIVREE));

        // --- Livraisons ---
        stats.put("livraisons_enAttente", livraisonRepository.countByStatus(LivraisonStatus.EN_ATTENTE));
        stats.put("livraisons_enCours", livraisonRepository.countByStatus(LivraisonStatus.EN_COURS));
        stats.put("livraisons_terminees", livraisonRepository.countByStatus(LivraisonStatus.LIVREE));

        return ResponseEntity.ok(stats);
    }


    @GetMapping("/users/by-role")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole() {
        List<Object[]> results = userRepository.countUsersByRole();

        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("role", row[0]);
            map.put("count", row[1]);
            data.add(map);
        }
        return ResponseEntity.ok(data);
    }



    @GetMapping("/recettes-par-jour-livreur")
    public List<Object[]> getRecettesParJourParLivreur() {
        return dashboardService.recetteParJourParLivreur();
    }


    @GetMapping("/colis/taux-reussite")
    public ResponseEntity<Double> tauxReussite() {
        long total = colisRepository.countTotal();
        long livres = colisRepository.countLivres();
        double taux = (total == 0) ? 0 : (livres * 100.0 / total);
        return ResponseEntity.ok(taux);
    }
    @GetMapping("/colis/delai-moyen")
    public ResponseEntity<Double> delaiMoyen() {
        return ResponseEntity.ok(historiqueStatutRepository.delaiMoyenLivraison());
    }


    @GetMapping("/colis/recettes-clients")
    public ResponseEntity<List<Object[]>> recettesParClient() {
        return ResponseEntity.ok(colisRepository.recettesTotalesParClient());
    }

    @GetMapping("/colis/recettes-par-jour-client")
    public ResponseEntity<List<Object[]>> recettesParJourClient() {
        return ResponseEntity.ok(colisRepository.recettesParJourParClient());
    }




    @GetMapping("/livreurs/colis-livres")
    public ResponseEntity<List<Object[]>> getColisLivresParLivreur() {
        return ResponseEntity.ok(colisRepository.nombreColisLivresParLivreur());
    }

    @GetMapping("/livreurs/taux-reussite")
    public ResponseEntity<List<Object[]>> getTauxReussiteParLivreur() {
        return ResponseEntity.ok(colisRepository.tauxReussiteParLivreur());
    }

    @GetMapping("/livreurs/tournees-actives")
    public ResponseEntity<List<Object[]>> getTourneesActives() {
        return ResponseEntity.ok(tourneeRepository.suiviTourneesAujourdHui());
    }


    @GetMapping("/reclamations/stats")
    public ResponseEntity<List<Object[]>> getReclamationsStats() {
        return ResponseEntity.ok(reclamationRepository.countByStatut());
    }






}
