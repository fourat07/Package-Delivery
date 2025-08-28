package stage.livraison.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Livraison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codeBarre; // pour QR global

    private LocalDateTime dateCreation = LocalDateTime.now();

    private String reference;        // ex: LVR-2025-0001

    @Enumerated(EnumType.STRING)
    private LivraisonStatus status = LivraisonStatus.EN_ATTENTE;


    @OneToMany(mappedBy = "livraison", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Colis> colisList = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id_user")
    private User user;



    @ManyToOne
    @JoinColumn(name = "tournee_id")
    @JsonIgnore
    private Tournee tournee;

    @JsonProperty("colisCount") // 👈 force l’apparition dans le JSON
    public int getColisCount() {
        return colisList != null ? colisList.size() : 0;
    }
}
