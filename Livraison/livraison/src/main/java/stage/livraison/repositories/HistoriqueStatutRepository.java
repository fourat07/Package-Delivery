package stage.livraison.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Colis;
import stage.livraison.entities.HistoriqueStatut;

import java.util.List;

@Repository
public interface HistoriqueStatutRepository extends JpaRepository<HistoriqueStatut,Long> {
    // Filter by colis
    // Filter by colis
/*    List<HistoriqueStatut> findByColisId(Long colisId);

    // Filter by livraison
    List<HistoriqueStatut> findByLivraisonId(Long livraisonId);

    // Filter by nouveau statut
    List<HistoriqueStatut> findByNouveauStatut(StatutColis statut);

    // Filter by colis AND livraison
    List<HistoriqueStatut> findByColis_IdAndLivraison_Id(Long colisId, Long livraisonId);

    // Filter by colis AND statut
    List<HistoriqueStatut> findByColis_IdAndNouveauStatut(Long colisId, StatutColis statut);

    // Filter by livraison AND statut
    List<HistoriqueStatut> findByLivraison_IdAndNouveauStatut(Long livraisonId, StatutColis statut);

    // Filter by colis AND livraison AND statut
    List<HistoriqueStatut> findByColis_IdAndLivraison_IdAndNouveauStatut(
            Long colisId,
            Long livraisonId,
            StatutColis statut
    );*/

    List<HistoriqueStatut> findByColisIdOrderByDateChangementAsc(Long colisId);

    // méthode pour récupérer tous les historiques d’une livraison
    List<HistoriqueStatut> findByColisLivraisonIdOrderByDateChangementAsc(Long livraisonId);




        @Query(value = "SELECT AVG(TIMESTAMPDIFF(DAY, l.date_creation, h.date_changement)) " +
                "FROM historique_statut h " +
                "JOIN colis c ON h.colis_id = c.id " +
                "JOIN livraison l ON c.livraison_id = l.id " +
                "WHERE h.nouveau_statut = 'LIVRE'", nativeQuery = true)
        Double delaiMoyenLivraison();






}



