package stage.livraison.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Getter
@Setter
public class Colis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adresse;
    private String telephone;
    private float prix;

    @Enumerated(EnumType.STRING)
    private Paiement paiement;

    private int nbArticle;
    private String remarque;

    private String codeBarre; // unique

    @Enumerated(EnumType.STRING)
    private StatutColis statut_colis;

    @ManyToOne
    @JoinColumn(name = "user_id_user")
    private User user;

    @OneToMany(mappedBy = "colis", cascade = CascadeType.ALL)
    @JsonIgnore // prevents sending all historique in the colis JSON
    private List<HistoriqueStatut> historique_Colis = new ArrayList<>();



    @ManyToOne
    @JoinColumn(name = "livraison_id")
    @JsonIgnore // Add this annotation to break the cycle
    @JsonIgnoreProperties({"colisList"})
    private Livraison livraison; // si tu as une livraison globale

    //private boolean copie = false; // false = original, true = copie

private LocalDateTime dateCretaion;


}
