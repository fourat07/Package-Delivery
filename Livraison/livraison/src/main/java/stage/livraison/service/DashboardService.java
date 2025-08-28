package stage.livraison.service;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import stage.livraison.entities.StatutColis;
import stage.livraison.repositories.ColisRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class DashboardService {

    private final ColisRepository colisRepository;

    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("colisTotal", colisRepository.count());
        stats.put("enAttente", colisRepository.countByStatutColis(StatutColis.EN_ATTENTE));
        stats.put("enCours", colisRepository.countByStatutColis(StatutColis.EN_COURS));
        stats.put("livres", colisRepository.countByStatutColis(StatutColis.LIVRE));
        stats.put("retours", colisRepository.countByStatutColis(StatutColis.RETOUR));
        stats.put("echanges", colisRepository.countByStatutColis(StatutColis.ECHANGE));
        //stats.put("recetteTotaleParJour",colisRepository.recetteParJourParLivreur());
        return stats;
    }

    public List<Object[]> recetteParJourParLivreur() {
        return colisRepository.recetteParJourParLivreur();
    }





}
