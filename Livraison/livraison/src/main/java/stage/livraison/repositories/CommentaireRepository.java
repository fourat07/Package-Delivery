package stage.livraison.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Commentaire;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire,Long> {

    List<Commentaire> findByReclamationId(Long reclamationId);

}
