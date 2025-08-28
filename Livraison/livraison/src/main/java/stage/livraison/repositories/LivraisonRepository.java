package stage.livraison.repositories;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Colis;
import stage.livraison.entities.Livraison;
import stage.livraison.entities.LivraisonStatus;

import java.util.List;
import java.util.Optional;
@Repository
public interface LivraisonRepository extends JpaRepository<Livraison,Long> {

    Optional<Livraison> findById(Long id);

    List<Livraison> findByUser_idUser(Long userId);

    @Query("SELECT l FROM Livraison l LEFT JOIN FETCH l.colisList WHERE l.tournee IS NULL")
    List<Livraison> findPendingWithColis();

    @Query("SELECT l FROM Livraison l LEFT JOIN FETCH l.colisList LEFT JOIN FETCH l.tournee t LEFT JOIN FETCH t.livraisons WHERE l.id = :id")
    Optional<Livraison> findByIdWithColisAndTournee(@Param("id") Long id);

    @Query("SELECT COUNT(c) FROM Livraison c WHERE c.status = :statut")
    long countByStatus(@Param("statut") LivraisonStatus statut);








}
