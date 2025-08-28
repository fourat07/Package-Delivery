package stage.livraison.entities;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
public class HistoriqueStatut {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING) // This is crucial
    private StatutColis ancienStatut;

    @Enumerated(EnumType.STRING) // This is crucial
    private StatutColis nouveauStatut;

    private LocalDateTime dateChangement;

    @ManyToOne
    @JoinColumn(name = "colis_id")
    private Colis colis;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 255)
    private String commentaire;



    public HistoriqueStatut(Long id, StatutColis ancienStatut, StatutColis nouveauStatut, LocalDateTime dateChangement, Colis colis, User user, String commentaire) {
        this.id = id;
        this.ancienStatut = ancienStatut;
        this.nouveauStatut = nouveauStatut;
        this.dateChangement = dateChangement;
        this.colis = colis;
        this.user = user;
        this.commentaire = commentaire;
    }

    public HistoriqueStatut() {

    }
}
