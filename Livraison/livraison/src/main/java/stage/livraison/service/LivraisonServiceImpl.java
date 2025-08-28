package stage.livraison.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stage.livraison.entities.*;
import stage.livraison.repositories.ColisRepository;
import stage.livraison.repositories.HistoriqueStatutRepository;
import stage.livraison.repositories.LivraisonRepository;
import stage.livraison.repositories.UserRepository;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LivraisonServiceImpl {

    private final LivraisonRepository livraisonRepo;
    private final ColisRepository colisRepo;
    private final HistoriqueStatutRepository histRepo;
    @Autowired
    private UserRepository userRepository;
/*    public Livraison createLivraisonWithColis(List<Long> colisIds) {
        Livraison livraison = new Livraison();
        livraison.setCodeBarre(UUID.randomUUID().toString());

        List<Colis> colisList = colisRepo.findAllById(colisIds);
        for (Colis c : colisList) {
            c.setLivraison(livraison); // assigner la livraison
        }

        livraison.setColisList(colisList);
        return livraisonRepo.save(livraison);
    }*/



   /* public Livraison createLivraison(List<Long> colisIds) {
        if (colisIds == null || colisIds.isEmpty())
            throw new IllegalArgumentException("Aucun colis sélectionné");

        // Récupère colis
        List<Colis> colisList = colisRepo.findAllById(colisIds);
        if (colisList.isEmpty()) throw new IllegalArgumentException("Colis introuvables");

        // Crée livraison
        Livraison l = new Livraison();
        l.setReference("LVR-" + System.currentTimeMillis());
        l.setCodeBarre(UUID.randomUUID().toString());
        livraisonRepo.save(l);

        // Ajoute items + statut initial
        for (Colis c : colisList) {
            LivraisonColis item = new LivraisonColis();
            item.setLivraison(l);
            item.setColis(c);
            item.setStatut(StatutColis.EN_ATTENTE);
            item.setLastUpdate(LocalDateTime.now());
            lcRepo.save(item);

            // Historique
            HistoriqueStatut h = new HistoriqueStatut();
            h.setColis(c); h.setLivraison(l);
            h.setAncienStatut(null);
            h.setNouveauStatut(StatutColis.EN_ATTENTE);
            h.setUsername("SYSTEM"); h.setSource("CREATION_LIVRAISON");
            histRepo.save(h);
        }
        return l;
    }*/

   /* @Transactional
    public Livraison createLivraison(List<Long> colisIds, Principal authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        List<Colis> colisOriginaux = colisRepo.findAllById(colisIds);
        if (colisOriginaux.isEmpty()) {
            throw new IllegalArgumentException("Aucun colis trouvé pour les IDs donnés");
        }

        // ✅ une seule livraison
        Livraison livraison = new Livraison();
        livraison.setReference("LIV-" + UUID.randomUUID().toString().substring(0, 8));
        livraison.setCodeBarre(UUID.randomUUID().toString());
        livraison.setUser(user);

        List<Colis> copies = new ArrayList<>();

        for (Colis original : colisOriginaux) {
            Colis copie = new Colis();

            // ⚡ copier les infos importantes
            copie.setAdresse(original.getAdresse());
            copie.setTelephone(original.getTelephone());
            copie.setPrix(original.getPrix());
            copie.setPaiement(original.getPaiement());
            copie.setNbArticle(original.getNbArticle());
            copie.setRemarque(original.getRemarque());

            copie.setCodeBarre(UUID.randomUUID().toString()); // nouveau code-barres unique
            copie.setStatut_colis(StatutColis.EN_ATTENTE);   // statut par défaut
            copie.setUser(original.getUser());

            // ✅ ici, une seule livraison
            copie.setLivraison(livraison);

            copie.setCopie(true); // marquer que c'est une copie

            copies.add(copie);
        }

        livraison.setColisList(copies);

        return livraisonRepo.save(livraison);
    }
*/

    @Transactional
    public Livraison createLivraison(List<Long> colisIds, Principal authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username);

        List<Colis> colisOriginaux = colisRepo.findAllById(colisIds);
        if (colisOriginaux.isEmpty()) {
            throw new IllegalArgumentException("Aucun colis trouvé pour les IDs donnés");
        }

        // ✅ création de la livraison
        Livraison livraison = new Livraison();
        livraison.setReference("LIV-" + UUID.randomUUID().toString().substring(0, 8));
        livraison.setCodeBarre(UUID.randomUUID().toString());
        livraison.setUser(user);

        // ✅ associer directement les vrais colis
        for (Colis original : colisOriginaux) {
            original.setLivraison(livraison);
        }

        livraison.setColisList(colisOriginaux);

        return livraisonRepo.save(livraison);
    }



    public List<Livraison> getLivraisonForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return livraisonRepo.findAll();
        } else if (user.getRole()==Role.ROLE_EXPEDITEUR) {
            System.out.println("User ID: " + user.getIdUser() + ", Role: " + user.getRole());
            List<Livraison> colis = livraisonRepo.findByUser_idUser(user.getIdUser());
            System.out.println("Colis trouvés: " + colis.size());
            return colis;

        }
        return Collections.emptyList();
    }

/*    public void updateStatut(Long livraisonId, Long colisId, StatutColis newStatut, String username) {
        LivraisonColis item = lcRepo.findByLivraisonIdAndColisId(livraisonId, colisId)
                .orElseThrow();
        StatutColis old = item.getStatut();
        if (old == newStatut) return;

        item.setStatut(newStatut);
        item.setLastUpdate(LocalDateTime.now());
        lcRepo.save(item);

        HistoriqueStatut h = new HistoriqueStatut();
        h.setColis(item.getColis());
        h.setLivraison(item.getLivraison());
        h.setAncienStatut(old);
        h.setNouveauStatut(newStatut);
        h.setUsername(username);
        histRepo.save(h);
    }*/



    public List<Livraison> getPendingLivraisons() {
        return livraisonRepo.findPendingWithColis();
    }



}
