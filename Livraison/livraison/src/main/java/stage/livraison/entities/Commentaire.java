package stage.livraison.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Commentaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenu;

    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private User auteur;  // Agent ou Client

    @ManyToOne
    @JoinColumn(name = "reclamation_id")
    private Reclamation reclamation;
}
