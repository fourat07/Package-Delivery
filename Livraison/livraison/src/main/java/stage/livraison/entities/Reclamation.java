package stage.livraison.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.aspectj.weaver.loadtime.Agent;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Reclamation {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String titre;
        private String description;

        @Enumerated(EnumType.STRING)
        private ReclamationStatut statut = ReclamationStatut.EN_ATTENTE;

        private LocalDateTime dateCreation = LocalDateTime.now();

        // User = Agent
        @ManyToOne
        @JoinColumn(name = "agent_id")
        private User agentAttribue;

        // User = Client (Expéditeur)
        @ManyToOne
        @JoinColumn(name = "client_id")
        private User client;

        @OneToMany(mappedBy = "reclamation", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonIgnore
        private List<Commentaire> commentaires = new ArrayList<>();


        // getters et setters
    }

