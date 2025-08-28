package stage.livraison.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter


public class User {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    public Long idUser;
    public String username;
    public String email;
    public String adresse;
    public float frais_retour;
    public String phoneNumber;

    public String password;
    public String photo;

    @Enumerated(EnumType.STRING)
    public Role role;

    @OneToMany
    private List<Colis>colisList ;

    private boolean disponible;

    @Transient
    private Long nbReclamationsAssignees;









}
