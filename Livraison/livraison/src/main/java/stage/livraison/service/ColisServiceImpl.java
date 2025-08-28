package stage.livraison.service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stage.livraison.entities.*;
import stage.livraison.repositories.ColisRepository;
import stage.livraison.repositories.HistoriqueStatutRepository;
import stage.livraison.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@AllArgsConstructor
public class ColisServiceImpl {

    @Autowired
    private ColisRepository colisRepository;

    @Autowired
    private final HistoriqueStatutRepository historiqueRepository;

    @Autowired
    private final UserRepository userRepository;

    public List<Colis> getColisForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            // ✅ Admin voit uniquement les originaux
            return colisRepository.findAll();
        } else if (user.getRole() == Role.ROLE_EXPEDITEUR) {
            System.out.println("User ID: " + user.getIdUser() + ", Role: " + user.getRole());

            // ✅ Expéditeur voit uniquement ses originaux
            List<Colis> colis = colisRepository.findByUser_idUser(user.getIdUser());

            System.out.println("Colis originaux trouvés: " + colis.size());
            return colis;
        }
        return Collections.emptyList();
    }


/*
    public List<HistoriqueColis> getHistoriqueForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            return historiqueRepository.findAll();
        } else if (user.getRole()==Role.ROLE_EXPEDITEUR) {
            List<HistoriqueColis> historiqueColis = historiqueRepository.findByUser_idUser(user.getIdUser());
            return historiqueColis;

        }
        return Collections.emptyList();
    }
*/


    @Transactional
    public Colis changerStatut(Long colisId, StatutColis nouveauStatut, String username, String commentaire) {
        Colis colis = colisRepository.findById(colisId)
                .orElseThrow(() -> new RuntimeException("Colis introuvable"));

        StatutColis ancienStatut = colis.getStatut_colis();

        if (ancienStatut == nouveauStatut) return colis;

        colis.setStatut_colis(nouveauStatut);
        colisRepository.save(colis);

        User user = userRepository.findByUsername(username);
        //.orElse(null);

        HistoriqueStatut historique = HistoriqueStatut.builder()
                .colis(colis)
                .ancienStatut(ancienStatut)
                .nouveauStatut(nouveauStatut)
                .dateChangement(LocalDateTime.now())
                .user(user)
                .commentaire(commentaire)
                .build();

        historiqueRepository.save(historique);

        return colis;
    }


    // récupérer l’historique d’un colis
    public List<HistoriqueStatut> getHistoriqueColis(Long colisId) {
        return historiqueRepository.findByColisIdOrderByDateChangementAsc(colisId);
    }

    // récupérer l’historique de tous les colis d’une livraison
    public List<HistoriqueStatut> getHistoriqueLivraison(Long livraisonId) {
        return historiqueRepository.findByColisLivraisonIdOrderByDateChangementAsc(livraisonId);
    }
}
