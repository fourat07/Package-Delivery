package stage.livraison.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tournee {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date; // tournée date

    @ManyToOne
    @JoinColumn(name = "livreur_id")
    private User livreur;

    @OneToMany
    @JoinColumn(name = "tournee_id")

    private List<Livraison> livraisons;

    @Enumerated(EnumType.STRING)
    private TourneeStatus status;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;




    private LocalDateTime datePickup;

    public int getLivraisonsCount() {
        return (livraisons != null) ? livraisons.size() : 0;
    }

}
