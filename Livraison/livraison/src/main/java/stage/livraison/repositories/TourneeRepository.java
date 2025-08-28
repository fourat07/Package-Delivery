package stage.livraison.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.StatutColis;
import stage.livraison.entities.Tournee;
import stage.livraison.entities.TourneeStatus;
import stage.livraison.entities.User;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TourneeRepository extends JpaRepository<Tournee,Long> {

    List<Tournee> findByLivreurAndDate(User livreur, LocalDate date);
    List<Tournee> findByLivreur(User livreur);
    List<Tournee>findByLivreur_idUser(Long idUser);


    @Query("SELECT t.status, COUNT(t) FROM Tournee t WHERE DATE(t.createdAt) = CURRENT_DATE GROUP BY t.status")
    List<Object[]> suiviTourneesAujourdHui();



    @Query("SELECT COUNT(c) FROM Tournee c WHERE c.status = :statut")
    long countBystatus(@Param("statut") TourneeStatus statut);
}
