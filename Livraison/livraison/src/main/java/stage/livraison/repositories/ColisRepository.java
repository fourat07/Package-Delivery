package stage.livraison.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Colis;
import stage.livraison.entities.StatutColis;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ColisRepository extends JpaRepository<Colis,Long > {


   // @Query("SELECT c FROM Colis c WHERE c.user.idUser = :userId")
    List<Colis> findByUser_idUser( Long userId);

    //List<Colis> findByCopieFalse(); // tous les originaux
    //List<Colis> findByUser_idUserAndCopieFalse(Long idUser); // originaux par user





        @Query("SELECT COUNT(c) FROM Colis c WHERE c.statut_colis = :statut")
        long countByStatutColis(@Param("statut") StatutColis statut);



    @Query("SELECT COUNT(c) FROM Colis c")
    long countTotal();

    @Query("SELECT COUNT(c) FROM Colis c WHERE c.statut_colis = 'LIVRE'")
    long countLivres();
    @Query("SELECT DATE(l.dateCreation), l.user.username, SUM(c.prix) " +
            "FROM Colis c JOIN c.livraison l " +
            "WHERE c.statut_colis = 'LIVRE' " +
            "GROUP BY DATE(l.dateCreation), l.user.username")
    List<Object[]> recetteParJourParLivreur();




 @Query("SELECT c.user.username, SUM(c.prix * c.nbArticle) " +
         "FROM Colis c " +
         "WHERE c.statut_colis = 'LIVRE' " +
         "GROUP BY c.user.username " +
         "ORDER BY SUM(c.prix * c.nbArticle) DESC")
 List<Object[]> recettesTotalesParClient();



 @Query("SELECT DATE(l.dateCreation), c.user.username, SUM(c.prix * c.nbArticle) " +
         "FROM Colis c JOIN c.livraison l " +
         "WHERE c.statut_colis = 'LIVRE' " +
         "GROUP BY DATE(l.dateCreation), c.user.username " +
         "ORDER BY DATE(l.dateCreation) DESC, SUM(c.prix * c.nbArticle) DESC")
 List<Object[]> recettesParJourParClient();








 @Query("SELECT l.user.username, COUNT(c) " +
         "FROM Colis c JOIN c.livraison l " +
         "WHERE c.statut_colis = 'LIVRE' " +
         "GROUP BY l.user.username " +
         "ORDER BY COUNT(c) DESC")
 List<Object[]> nombreColisLivresParLivreur();


 @Query("SELECT l.user.username, " +
         "SUM(CASE WHEN c.statut_colis = 'LIVRE' THEN 1 ELSE 0 END) * 100.0 / COUNT(c) " +
         "FROM Colis c JOIN c.livraison l " +
         "GROUP BY l.user.username")
 List<Object[]> tauxReussiteParLivreur();



}
