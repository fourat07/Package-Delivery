package stage.livraison.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Reclamation;
import stage.livraison.entities.ReclamationStatut;
import stage.livraison.entities.User;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation,Long> {

    List<Reclamation> findByClient(User client);
    List<Reclamation> findByAgentAttribue(User agent);

    List<Reclamation> findByAgentAttribue_IdUser(Long agentId);
    List<Reclamation> findByClient_IdUser(Long clientId);

    long countByAgentAttribue_IdUser(Long agentId);
    long countByAgentAttribue_IdUserAndStatut(Long agentId, ReclamationStatut statut);

    @Query("SELECT r.statut, COUNT(r) FROM Reclamation r GROUP BY r.statut")
    List<Object[]> countByStatut();


}
