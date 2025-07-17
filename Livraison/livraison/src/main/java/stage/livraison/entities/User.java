package stage.livraison.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.HashSet;
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
    public String password;
    public String phoneNumber;

    @Enumerated(EnumType.STRING)
    public Role role;

    @Enumerated(EnumType.STRING)
    public Tarification tarification;




}
