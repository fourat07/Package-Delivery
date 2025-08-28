import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Commentaire, Reclamation } from 'src/app/core/models/Reclamation';
import { ActivatedRoute } from '@angular/router';
import { CommentaireService } from 'src/app/services/commentaire/commentaire.service';
import { UserService } from 'src/app/features/user/services/user/user.service';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from 'src/app/services/reclamation/reclamation.service';

@Component({
  selector: 'app-details-reclamation',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './details-reclamation.component.html',
  styleUrls: ['./details-reclamation.component.css']
})
export class DetailsReclamationComponent  implements OnInit , AfterViewChecked {
    reclamation?: Reclamation;
  reclamationId!: number;
  commentaires: Commentaire[] = [];
  newMessage: string = '';

  currentUserRole: string = '';
  currentUser: any;
  editingCommentId: number | null = null;
editedContent: string = '';

  constructor(private route: ActivatedRoute, private commentaireService: CommentaireService, private authService :UserService,
      private reclamationService: ReclamationService) {}

  ngOnInit() {
    this.reclamationId = +this.route.snapshot.paramMap.get('id')!;
    this.loadReclamation();
    this.loadCommentaires();
      this.currentUser = this.authService.getCurrentUser(); // ou depuis localStorage
    this.currentUserRole = this.currentUser?.role || '';
     this.loadCommentaires();
  }



@ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  loadReclamation() {
    this.reclamationService.getById(this.reclamationId).subscribe(data => {
      this.reclamation = data;
    });
  }

  loadCommentaires() {
    this.commentaireService.getByReclamation(this.reclamationId).subscribe({
      next: (res) => (this.commentaires = res),
      error: (err) => console.error(err)
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.commentaireService.add(this.reclamationId, this.currentUser.idUser, this.newMessage).subscribe({
      next: (res) => {
        this.commentaires.push(res);
        this.newMessage = '';
      },
      error: (err) => console.error(err)
    });
  }

    // ✅ Condition d’autorisation
  canSendMessage(): boolean {
    if (this.currentUserRole === 'ROLE_ADMIN' || this.currentUserRole === 'ROLE_AGENT') {
      return true; // Agent/Admin → toujours autorisés
    }

    if (this.currentUserRole === 'ROLE_EXPEDITEUR') {
      // Vérifie s'il existe un message écrit par Admin ou Agent
      return this.commentaires.some(
        c => c.auteur?.role === 'ROLE_ADMIN' || c.auteur?.role === 'ROLE_AGENT'
      );
    }

    return false;
  }

getMessageClass(comment: Commentaire) {
  if (comment.auteur?.role === 'ROLE_ADMIN') {
    return 'admin-message';
  }
  if (comment.auteur?.role === 'ROLE_AGENT') {
    return 'agent-message';
  }
  if (comment.auteur?.role === 'ROLE_EXPEDITEUR') {
    return 'expediteur-message';
  }
  return '';
}

startEdit(c: any) {
  this.editingCommentId = c.id;
  this.editedContent = c.contenu;
}

saveEdit(c: any) {
  if (!this.editedContent.trim()) return;
  this.commentaireService.updateComment(c.id, this.editedContent).subscribe({
    next: (res) => {
      c.contenu = res.contenu;
      this.editingCommentId = null;
    },
    error: (err) => console.error('Erreur update commentaire', err)
  });
}

cancelEdit() {
  this.editingCommentId = null;
  this.editedContent = '';
}

}
