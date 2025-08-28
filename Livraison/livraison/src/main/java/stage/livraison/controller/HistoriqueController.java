package stage.livraison.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.*;
import stage.livraison.repositories.HistoriqueStatutRepository;
import stage.livraison.repositories.TourneeRepository;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/historique")
@RequiredArgsConstructor
public class HistoriqueController {


    private final HistoriqueStatutRepository histRepo;
    private final TourneeRepository tourneeRepository;


    @GetMapping("/all")
    public List<HistoriqueStatut> getAllHistorique() {
        return  histRepo.findAll();
    }



    @GetMapping("/{tourneeId}/details-with-historique")
    public Map<String, Object> getTourneeDetailsWithHistorique(@PathVariable Long tourneeId) {
        Tournee t = tourneeRepository.findById(tourneeId)
                .orElseThrow(() -> new RuntimeException("Tournée introuvable"));

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> livraisonsList = new ArrayList<>();

        for (Livraison livraison : t.getLivraisons()) {
            Map<String, Object> livraisonData = new HashMap<>();
            livraisonData.put("livraisonId", livraison.getId());
            livraisonData.put("reference", livraison.getReference());
            livraisonData.put("status", livraison.getStatus());
            livraisonData.put("dateCreation", livraison.getDateCreation());

            // --- Liste des colis avec historique inclus ---
            List<Map<String, Object>> colisList = new ArrayList<>();
            for (Colis colis : livraison.getColisList()) {
                Map<String, Object> colisData = new HashMap<>();
                colisData.put("id", colis.getId());
                colisData.put("codeBarre", colis.getCodeBarre());
                colisData.put("adresse", colis.getAdresse());
                colisData.put("telephone", colis.getTelephone());
                colisData.put("prix", colis.getPrix());
                colisData.put("paiement", colis.getPaiement());
                colisData.put("statut_colis", colis.getStatut_colis());
                colisData.put("user", colis.getUser());
                colisData.put("frais_retour", colis.getUser() != null ? colis.getUser().getFrais_retour() : 0);

                // ✅ Charger l’historique de ce colis
                List<Map<String, Object>> historiqueList = histRepo
                        .findByColisIdOrderByDateChangementAsc(colis.getId())
                        .stream()
                        .map(h -> {
                            Map<String, Object> histMap = new HashMap<>();
                            histMap.put("ancienStatut", h.getAncienStatut());
                            histMap.put("nouveauStatut", h.getNouveauStatut());
                            histMap.put("dateChangement", h.getDateChangement());
                            histMap.put("changedBy", h.getUser() != null ? h.getUser().getUsername() : null);
                            histMap.put("commentaire", h.getCommentaire());
                            return histMap;
                        })
                        .toList();

                colisData.put("historique", historiqueList);

                colisList.add(colisData);
            }

            livraisonData.put("colisList", colisList);
            livraisonData.put("colisCount", colisList.size());
            livraisonsList.add(livraisonData);
        }

        response.put("tourneeId", t.getId());
        response.put("date", t.getDate());
        response.put("livreur", t.getLivreur());
        response.put("status", t.getStatus());
        response.put("livraisons", livraisonsList);
        response.put("livraisonsCount", livraisonsList.size());

        return response;
    }

}

    /** Rech/filtre côté serveur (facile) */
/*    @GetMapping
    public List<HistoriqueStatut> search(
            @RequestParam(required = false) Long colisId,
            @RequestParam(required = false) Long livraisonId,
            @RequestParam(required = false) StatutColis statut) {

        if (colisId != null && livraisonId != null && statut != null) {
            return histRepo.findByColis_IdAndLivraison_IdAndNouveauStatut(colisId, livraisonId, statut);
        } else if (colisId != null && livraisonId != null) {
            return histRepo.findByColis_IdAndLivraison_Id(colisId, livraisonId);
        } else if (colisId != null && statut != null) {
            return histRepo.findByColis_IdAndNouveauStatut(colisId, statut);
        } else if (livraisonId != null && statut != null) {
            return histRepo.findByLivraison_IdAndNouveauStatut(livraisonId, statut);
        } else if (colisId != null) {
            return histRepo.findByColisId(colisId);
        } else if (livraisonId != null) {
            return histRepo.findByLivraisonId(livraisonId);
        } else if (statut != null) {
            return histRepo.findByNouveauStatut(statut);
        } else {
            return histRepo.findAll();
        }
    }



    *//** Export CSV (filtrable) *//*
    @GetMapping(value="/export", produces="text/csv")
    public void exportCsv(HttpServletResponse resp,
                          @RequestParam(required=false) Long colisId,
                          @RequestParam(required=false) Long livraisonId) throws IOException {
        resp.setHeader("Content-Disposition", "attachment; filename=historique.csv");
        PrintWriter w = resp.getWriter();
        w.println("date,colisId,livraisonId,ancienStatut,nouveauStatut,username,source");

        histRepo.findAll(Sort.by("date").descending()).stream()
                .filter(h -> colisId == null || (h.getColis()!=null && h.getColis().getId().equals(colisId)))
                .filter(h -> livraisonId == null || (h.getLivraison()!=null && h.getLivraison().getId().equals(livraisonId)))
                .forEach(h -> w.printf("%s,%s,%s,%s,%s,%s%n",
                        h.getDate(),
                        h.getColis()!=null ? h.getColis().getId() : "",
                        h.getLivraison()!=null ? h.getLivraison().getId() : "",
                        h.getAncienStatut(),
                        h.getNouveauStatut(),
                        h.getUsername()));
        w.flush();
    }


    @GetMapping("/{tourneeId}/details-with-historique")
public Map<String, Object> getTourneeDetailsWithHistorique(@PathVariable Long tourneeId) {
    Tournee t = tourneeRepository.findById(tourneeId)
            .orElseThrow(() -> new RuntimeException("Tournée introuvable"));

    Map<String, Object> response = new HashMap<>();
    List<Map<String, Object>> livraisonsList = new ArrayList<>();

    for (Livraison livraison : t.getLivraisons()) {
        Map<String, Object> livraisonData = new HashMap<>();
        livraisonData.put("livraisonId", livraison.getId());
        livraisonData.put("reference", livraison.getReference());
        livraisonData.put("status", livraison.getStatus());
        livraisonData.put("dateCreation", livraison.getDateCreation());

        // --- Liste des colis avec historique inclus ---
        List<Map<String, Object>> colisList = new ArrayList<>();
        for (Colis colis : livraison.getColisList()) {
            Map<String, Object> colisData = new HashMap<>();
            colisData.put("id", colis.getId());
            colisData.put("codeBarre", colis.getCodeBarre());
            colisData.put("adresse", colis.getAdresse());
            colisData.put("telephone", colis.getTelephone());
            colisData.put("prix", colis.getPrix());
            colisData.put("paiement", colis.getPaiement());
            colisData.put("statut_colis", colis.getStatut_colis());
            colisData.put("user", colis.getUser());
            colisData.put("frais_retour", colis.getUser() != null ? colis.getUser().getFrais_retour() : 0);

            // ✅ Charger l’historique de ce colis
            List<Map<String, Object>> historiqueList = historiqueRepository
                    .findByColisIdOrderByDateChangementAsc(colis.getId())
                    .stream()
                    .map(h -> Map.of(
                            "ancienStatut", h.getAncienStatut(),
                            "nouveauStatut", h.getNouveauStatut(),
                            "dateChangement", h.getDateChangement(),
                            "changedBy", h.getUser() != null ? h.getUser().getUsername() : null,
                            "commentaire", h.getCommentaire()
                    ))
                    .toList();

            colisData.put("historique", historiqueList);

            colisList.add(colisData);
        }

        livraisonData.put("colisList", colisList);
        livraisonData.put("colisCount", colisList.size());
        livraisonsList.add(livraisonData);
    }

    response.put("tourneeId", t.getId());
    response.put("date", t.getDate());
    response.put("livreur", t.getLivreur());
    response.put("status", t.getStatus());
    response.put("livraisons", livraisonsList);
    response.put("livraisonsCount", livraisonsList.size());

    return response;
}
*/
