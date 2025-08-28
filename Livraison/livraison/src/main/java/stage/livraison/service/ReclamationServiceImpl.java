package stage.livraison.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stage.livraison.entities.Reclamation;
import stage.livraison.entities.ReclamationStatut;
import stage.livraison.entities.User;
import stage.livraison.repositories.ReclamationRepository;
import stage.livraison.repositories.UserRepository;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReclamationServiceImpl {

    private final ReclamationRepository reclamationRepository;
    private final UserRepository userRepository;

    public Reclamation createReclamation(Reclamation reclamation, Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));
        reclamation.setClient(client);
        reclamation.setStatut(ReclamationStatut.EN_ATTENTE);
        return reclamationRepository.save(reclamation);
    }

    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAll();
    }

/*
    public Reclamation assignAgent(Long reclamationId, Long agentId) {
        Reclamation rec = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));
        rec.setAgentAttribue(agent);
        agent.setDisponible(false);
        return reclamationRepository.save(rec);
    }
*/

    @Transactional
    public Reclamation assignAgent(Long reclamationId, Long agentId) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));

        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));

        // Vérifier les réclamations actives actuelles
        long activeCount = reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                agentId, ReclamationStatut.EN_ATTENTE
        );

        if (activeCount >= 3) {
            throw new RuntimeException("Cet agent a déjà atteint la limite de 3 réclamations actives");
        }

        // Assigner l'agent
        reclamation.setAgentAttribue(agent);
        if (reclamation.getStatut() == null) {
            reclamation.setStatut(ReclamationStatut.EN_ATTENTE);
        }

        reclamationRepository.save(reclamation);

        // ⚡ Recompter après assignation (plus sûr que activeCount + 1)
        long newActiveCount = reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                agentId, ReclamationStatut.EN_ATTENTE
        );

        agent.setDisponible(newActiveCount < 3);
        userRepository.save(agent);

        return reclamation;
    }






    @Transactional
    public Reclamation updateStatut(Long reclamationId, ReclamationStatut nouveauStatut) {
        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));

        reclamation.setStatut(nouveauStatut);
        reclamation = reclamationRepository.save(reclamation);

        // Si un agent est assigné → recalculer sa dispo
        if (reclamation.getAgentAttribue() != null) {
            Long agentId = reclamation.getAgentAttribue().getIdUser();

            long activeCount = reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                    agentId, ReclamationStatut.EN_ATTENTE
            );

            User agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent introuvable"));

           agent.setDisponible(activeCount<3);


            userRepository.save(agent);
        }

        return reclamation;
    }



    public void deleteReclamation(Long id) {
        reclamationRepository.deleteById(id);
    }

 /*   public Reclamation addComment(Long id, String commentaire) {
        Reclamation rec = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));
        rec.setCommentaire(commentaire);
        return reclamationRepository.save(rec);
    }*/


    public List<Reclamation> getReclamationsByAgent(Long agentId) {
        return reclamationRepository.findByAgentAttribue_IdUser(agentId);
    }

    public List<Reclamation> getReclamationsByClient(Long clientId) {
        return reclamationRepository.findByClient_IdUser(clientId);
    }


    public void libererAgentSiPossible(Long agentId) {
        long activeCount = reclamationRepository.countByAgentAttribue_IdUserAndStatut(
                agentId, ReclamationStatut.EN_ATTENTE
        );

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));

        agent.setDisponible(activeCount < 3);

        userRepository.save(agent);
    }







}
