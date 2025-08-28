package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.Colis;
import stage.livraison.entities.HistoriqueStatut;
import stage.livraison.entities.Livraison;
import stage.livraison.entities.User;
import stage.livraison.repositories.ColisRepository;
import stage.livraison.repositories.HistoriqueStatutRepository;
import stage.livraison.repositories.LivraisonRepository;
import stage.livraison.repositories.UserRepository;
import stage.livraison.service.LivraisonServiceImpl;
import stage.livraison.service.QrService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/livraison")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j

public class LivraisonController {


    private final ColisRepository colisRepo;
    private final LivraisonRepository livraisonRepo;
    private final LivraisonServiceImpl service;
    @Autowired
    private UserRepository userRepository;
    private final HistoriqueStatutRepository historiqueRepository;

    private final LivraisonServiceImpl serviceL;

    private final QrService qrService; // service pour générer QR code en Base64

    /*    */

    /**
     * 1️⃣ Créer une livraison globale
     *//*
    @PostMapping("/create")
    public ResponseEntity<?> createLivraison(@RequestBody List<Long> colisIds) {
        // Récupérer les colis sélectionnés
        List<Colis> colisList = colisRepo.findAllById(colisIds);
        if (colisList.isEmpty()) return ResponseEntity.badRequest().body("Aucun colis trouvé");

        // Créer la livraison
        Livraison livraison = new Livraison();
        livraison.setCodeBarre(UUID.randomUUID().toString());
        livraison.setColisList(colisList);

        // Lier chaque colis à la livraison
        for (Colis c : colisList) {
            c.setLivraison(livraison);
        }

        livraisonRepo.save(livraison);
        colisRepo.saveAll(colisList);

        // Générer QR code Base64 (URL par ex: http://front/scan/livraison?livraisonId=xxx)
        String qrUrl = "http://localhost:4200/scan/livraison?livraisonId=" + livraison.getId();
        String qrBase64 = qrService.generateQrCode(qrUrl);

        return ResponseEntity.ok(Map.of(
                "livraisonId", livraison.getId(),
                "qrCodeBase64", qrBase64
        ));
    }*/

/*    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody List<Long> colisIds) {
        Livraison l = service.createLivraison(colisIds);
        return ResponseEntity.ok(Map.of(
                "id", l.getId(),
                "reference", l.getReference(),
                "codeBarre", l.getCodeBarre()
        ));
    }*/

/*    @PostMapping("/create")
    public ResponseEntity<?> createLivraison(@RequestBody List<Long> colisIds) {
        if (colisIds == null || colisIds.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠ Aucun colis sélectionné");
        }

        // 🔹 Call service to create livraison + link colis
        Livraison livraison = service.createLivraison(colisIds);

        // 🔹 Generate global QR Code
        String qrUrl = "http://localhost:4200/scan/livraison?livraisonId=" + livraison.getId();
        String qrBase64 = qrService.generateQrCode(qrUrl);

        // 🔹 Response payload
        return ResponseEntity.ok(Map.of(
                "id", livraison.getId(),
                "reference", livraison.getReference(),
                "codeBarre", livraison.getCodeBarre(),
                "qrCodeBase64", qrBase64,
                "colisCount", livraison.getColisList() != null ? livraison.getColisList().size() : 0
        ));
    }*/
    @PostMapping("/create")
    public ResponseEntity<?> createLivraison(@RequestBody List<Long> colisIds, Principal authentication) {

        if (colisIds == null || colisIds.isEmpty()) {
            return ResponseEntity.badRequest().body("⚠ Aucun colis sélectionné");
        }

           Livraison livraison = service.createLivraison(colisIds, authentication);

            // ⚡ Générer le QR global TOUJOURS (même si 1 seul colis)
            String qrUrl = "http://localhost:4200/scan/livraison?livraisonId=" + livraison.getId();
            String qrBase64 = qrService.generateQrCode(qrUrl);

        return ResponseEntity.ok(Map.of(
                "id", livraison.getId(),
                "reference", livraison.getReference(),
                "codeBarre", livraison.getCodeBarre(),
                "qrCodeBase64", qrBase64,
                "colisList",livraison.getColisList(),
                "colisCount", livraison.getColisList().size()
        ));
    }



    @GetMapping
    public List<Map<String, Object>> list(Principal authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        List<Livraison> livraisons = serviceL.getLivraisonForUser(user);

        return livraisons.stream().map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", l.getId());
            map.put("reference", l.getReference());
            map.put("dateCreation", l.getDateCreation());
            map.put("status",l.getStatus());
            map.put("colisList",l.getColisList());
            map.put("user",l.getUser().username);

            // Compter uniquement les colis copies
            long nbCopies = l.getColisList() != null
                    ? (long) l.getColisList().size()
                    : 0;

            map.put("colisCount", nbCopies);
            return map;
        }).toList();
    }


/*    @GetMapping("/")
    public List<Map<String, Object>> listLivraisons() {
        return livraisonRepo.findAll().stream().map(l -> Map.of(
                "id", l.getId(),
                "reference", l.getReference(),
                "dateCreation", l.getDateCreation(),
                "colisCount", l.getColisList() != null ? l.getColisList().size() : 0
        )).toList();
    }*/


    /**
 /*    * Détails d’une livraison (avec items)
     *//*
    @GetMapping("/{id}")
    public Map<String, Object> details(@PathVariable Long id) {
        Livraison l = livraisonRepo.findById(id).orElseThrow();

        List<Map<String, Object>> items = lcRepo.findByLivraisonId(id).stream().map(i -> {
            Map<String, Object> item = new HashMap<>();
            item.put("livraisonColisId", i.getId());
            item.put("colisId", i.getColis().getId());
            item.put("codeBarre", i.getColis().getCodeBarre());
            item.put("statut", i.getStatut());
            item.put("lastUpdate", i.getLastUpdate());
            return item;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("id", l.getId());
        response.put("reference", l.getReference());
        response.put("dateCreation", l.getDateCreation());
        response.put("items", items);
        return response;
    }*/



    @GetMapping("{id}/historique")
    public Map<String, Object> historiqueLivraison(@PathVariable Long id) {
        Livraison l = livraisonRepo.findById(id).orElseThrow();

        Map<String, Object> response = new HashMap<>();
        Map<Long, Map<String, Object>> colisHistoriques = new HashMap<>();

        for (Colis c : l.getColisList()) {
            List<HistoriqueStatut> hist = historiqueRepository.findByColisIdOrderByDateChangementAsc(c.getId());

            Map<String, Object> colisData = new HashMap<>();
            colisData.put("codeBarre", c.getCodeBarre());
            colisData.put("adresse", c.getAdresse());
            colisData.put("telephone", c.getTelephone());

            colisData.put("prix", c.getPrix());
            colisData.put("paiement", c.getPaiement());
            colisData.put("statut_colis", c.getStatut_colis());
            colisData.put("user", c.getUser());
            colisData.put("frais_retour",c.getUser().frais_retour);


            colisData.put("historique", hist);

            colisHistoriques.put(c.getId(), colisData);
        }

        response.put("id", l.getId());
        response.put("reference", l.getReference());
        response.put("colisHistoriques", colisHistoriques);

        return response;
    }

    @DeleteMapping("/delete/{id}")
    private void deleteLiv(@PathVariable  Long id){
        livraisonRepo.deleteById(id);
    }



    @GetMapping("/pending")
    public List<Livraison> getPendingLivraisons() {
        return serviceL.getPendingLivraisons(); // livraisons not assigned to a tournée
    }


}
/*    *//** Changer le statut d’un item (colis dans livraison) *//*
    @PatchMapping("/{livraisonId}/colis/{colisId}/statut")
    public ResponseEntity<?> change(@PathVariable Long livraisonId,
                                    @PathVariable Long colisId,
                                    @RequestParam StatutColis statut,
                                    Principal principal) {
        service.updateStatut(livraisonId, colisId, statut, principal.getName());
        return ResponseEntity.ok().build();
    }
}*/
