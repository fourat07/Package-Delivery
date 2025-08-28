package stage.livraison.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stage.livraison.entities.Colis;
import stage.livraison.entities.Livraison;
import stage.livraison.repositories.ColisRepository;
import stage.livraison.repositories.LivraisonRepository;
import stage.livraison.service.PdfService;

import java.util.List;

@RestController
@RequestMapping("/pdf")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j

public class PdfController {

    private final PdfService pdfService;
    private final ColisRepository colisRepo;
    private final LivraisonRepository livraisonRepo;

  /*  @GetMapping("/colis/{id}")
    public ResponseEntity<byte[]> getColisPdf(@PathVariable Long id) throws Exception {
        Colis c = colisRepo.findById(id).orElseThrow();
        byte[] pdf = pdfService.generateColisPdf(c.getId(), c.getCodeBarre(), c.getStatut_colis().name());
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=colis_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
*/
  @GetMapping("/livraison/{id}")
  public ResponseEntity<byte[]> getLivraisonPdf(@PathVariable Long id) throws Exception {
      Livraison l = livraisonRepo.findById(id).orElseThrow();

      List<PdfService.ColisInfo> infos = l.getColisList().stream()
              .map(c -> new PdfService.ColisInfo(
                      c.getId(),
                      l.getReference(),
                      c.getCodeBarre(),
                      c.getAdresse(),
                      (c.getUser() != null) ? c.getUser().getUsername() : "client_inconnu",
                      c.getPrix(),
                      c.getRemarque()
              ))
              .toList();

      String clientName = (l.getUser() != null) ? l.getUser().getUsername() : "client_inconnu";
      Long tourneeId = (l.getTournee() != null) ? l.getTournee().getId() : 0L;

      byte[] pdf = pdfService.generateLivraisonPdf(l.getReference(), clientName, tourneeId, infos);

      return ResponseEntity.ok()
              .header(HttpHeaders.CONTENT_DISPOSITION,
                      "attachment; filename=\"livraison_" +
                              l.getReference() + "_" +
                              clientName + "_tournee" + tourneeId + ".pdf\"")
              .contentType(MediaType.APPLICATION_PDF)
              .body(pdf);
  }





}
