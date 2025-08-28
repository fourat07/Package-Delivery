package stage.livraison.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stage.livraison.entities.Role;
import stage.livraison.entities.User;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

    User findByUsername(String username);
    User findByEmail(String email);

    List<User> findByRole(Role role);
    List<User> findByRoleAndDisponible(Role role, boolean disponible);

    long countByRole(Role role);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();




}
