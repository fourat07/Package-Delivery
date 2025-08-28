package stage.livraison.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import stage.livraison.entities.*;
import stage.livraison.repositories.LivraisonRepository;
import stage.livraison.repositories.TourneeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.Collections;
import java.util.List;

@Service
@AllArgsConstructor
public class TourneeServiceImpl {

    private final TourneeRepository tourneeRepository;
    private final LivraisonRepository livraisonRepository;




    public List<Tournee> getTourneesForLivreur(User livreur, LocalDate date) {
        return tourneeRepository.findByLivreurAndDate(livreur, date);
    }

    public Tournee startTournee(Long tourneeId) {
        Tournee t = tourneeRepository.findById(tourneeId).orElseThrow();
        t.setStatus(TourneeStatus.EN_COURS);
        return tourneeRepository.save(t);
    }

    public Tournee completeTournee(Long tourneeId) {
        Tournee t = tourneeRepository.findById(tourneeId).orElseThrow();
        t.setStatus(TourneeStatus.LIVREE);
        t.setCompletedAt(LocalDateTime.now());
        return tourneeRepository.save(t);
    }

    public List<Tournee> getHistorique(User livreur) {
        return tourneeRepository.findByLivreur(livreur);
    }


    public Tournee createTournee(User livreur, List<Livraison> livraisons, LocalDateTime datePickup) {
        Tournee tournee = new Tournee();
        tournee.setLivreur(livreur);
        tournee.setDatePickup(datePickup); // single field with date+time
        tournee.setStatus(TourneeStatus.EN_ATTENTE);

        tournee = tourneeRepository.save(tournee);

        for (Livraison livraison : livraisons) {
            livraison.setTournee(tournee);

            if (livraison.getColisList() != null) {
                for (Colis colis : livraison.getColisList()) {
                    colis.setLivraison(livraison);
                }
            }

            livraisonRepository.save(livraison);
        }

        return tournee;
    }

    public List<Tournee> getTourneeForUser(User user) {
        if (user.getRole() == Role.ROLE_ADMIN) {
            // ✅ Admin voit uniquement les originaux
            return tourneeRepository.findAll();
        } else if (user.getRole() == Role.ROLE_LIVREUR) {


            // ✅ Expéditeur voit uniquement ses originaux


            return tourneeRepository.findByLivreur_idUser(user.getIdUser());
        }
        return Collections.emptyList();
    }





}
