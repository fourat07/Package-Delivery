package stage.livraison.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.BadElementException;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    public byte[] generateColisPdf(Long colisId, String code, String statut)
            throws IOException, WriterException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(); // Now using com.itextpdf.text.Document
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // Add content
        doc.add(new Paragraph("Bordereau de livraison — Colis #" + colisId));
        doc.add(new Paragraph("Code : " + code));
        doc.add(new Paragraph("Statut : " + statut));
        doc.add(new Paragraph(" "));

        // QR code
        Image qrImage = createQrImage("http://localhost:4200/scan/colis?colisId=" + colisId, 150, 150);
        doc.add(qrImage);

        doc.close();
        return baos.toByteArray();
    }

/*    public byte[] generateLivraisonPdf(Long livraisonId, List<ColisInfo> colisList)
            throws IOException, WriterException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, baos);
        doc.open();

        doc.add(new Paragraph("Bordereau global — Livraison #" + livraisonId));
        doc.add(new Paragraph("Nombre de colis : " + colisList.size()));
        doc.add(new Paragraph(" "));

        for (ColisInfo c : colisList) {
            doc.add(new Paragraph("Colis #" + c.id() + " — Code: " + c.code() + " — Statut: " + c.statut()));
            Image qrImage = createQrImage("http://localhost:4200/scan/colis?colisId=" + c.id(), 100, 100);
            doc.add(qrImage);
            doc.add(new Paragraph(" "));
        }

        // QR global pour livraison
        Image qrGlobal = createQrImage("http://localhost:4200/scan/livraison?livraisonId=" + livraisonId, 150, 150);
        doc.add(new Paragraph("QR global de la livraison"));
        doc.add(qrGlobal);

        doc.close();
        return baos.toByteArray();
    }*/


    public byte[] generateLivraisonPdf(String reference, String clientName, Long tourneeId, List<ColisInfo> colisList)
            throws IOException, WriterException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // ✅ En-tête global de la livraison
        doc.add(new Paragraph("📦 Bordereau global de la livraison"));

        doc.add(new Paragraph("Référence Livraison : " + reference));
        doc.add(new Paragraph("Client : " + clientName));
//        doc.add(new Paragraph("Tournée ID : " + tourneeId));
        doc.add(new Paragraph("Nombre de colis : " + colisList.size()));
        doc.add(new Paragraph(" "));

        // ✅ Liste des colis
        for (ColisInfo c : colisList) {
            doc.add(new Paragraph(
                    "Colis :"
                            + " — Code : " + c.code()
                            + " — Adresse : " + c.adresse()
                            + " — Prix : " + c.prix() + " DT"
                            + " — Client : " + c.client()
                            + " — Remarque : " + c.remarque()
            ));
            Image qrImage = createQrImage("http://localhost:4200/scan/colis?colisId=" + c.id(), 100, 100);
            doc.add(qrImage);
            doc.add(new Paragraph(" "));
        }

        // ✅ QR global seulement si >= 2 colis
        if (colisList.size() >= 2) {
            Image qrGlobal = createQrImage("http://localhost:4200/scan/livraison?livraisonId=" + tourneeId, 150, 150);
            doc.add(new Paragraph("QR global de la livraison"));
            doc.add(qrGlobal);
        }

        doc.close();
        return baos.toByteArray();
    }



    private Image createQrImage(String text, int width, int height)
            throws WriterException, IOException, BadElementException {
        QRCodeWriter qrWriter = new QRCodeWriter();
        var bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        var bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
        return Image.getInstance(bufferedImage, null);
    }

    public record ColisInfo(Long id, String reference, String code, String adresse, String client, float prix, String remarque) {}
}