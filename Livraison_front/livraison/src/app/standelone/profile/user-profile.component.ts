  import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { HttpClient } from '@angular/common/http';
  import { FormsModule, NgForm } from '@angular/forms';
  import { UserService } from 'src/app/features/user/services/user/user.service';
  import { ActivatedRoute } from '@angular/router';

  interface User {
  username: string;
    role: string;
    token: string;
    email?: string;       // Make optional if not always present
    adresse?: string;     // Make optional if not always present
    phoneNumber?: string; // Make optional if not always present
    photo?: string;       // Make optional if not always present
  }

  interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  @Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule,FormsModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
  })
  export class UserProfileComponent implements OnInit, AfterViewInit {

    // Password change form
    passwordData: PasswordData = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };  

    @Input() user: any;

    // UI states
    editMode: boolean = false;
    isLoading: boolean = false;
    selectedFile: File | null = null;
    previewUrl: string | null = null;
    hoverAvatar = false;
    userid: any;
    model: any = {};
    errorMessage = '';
    photoUrl: string = '';
    
    // Store timestamp to prevent regeneration - only set when photo changes

        currentUserRole: string = '';


    @Output() userUpdated = new EventEmitter<any>();

    constructor(private authService: UserService,private route: ActivatedRoute,private cdRef: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.loadUserData();

      const user = this.authService.getCurrentUser();
      this.currentUserRole = user?.role || '';
      
  
      
   
      

    }

    ngAfterViewInit(): void {
      setTimeout(() => {
        // Tu peux recharger les données ou mettre à jour la photoUrl par exemple
        if (this.model.photo) {
          this.photoUrl = this.generatePhotoUrl(this.model.photo);
          this.cdRef.detectChanges(); // informe Angular de la modification
        }
      });
    }

    // Fixed method - proper URL encoding handling
generatePhotoUrl(filename: string): string {
  if (!filename) return 'assets/images/default.png';

  try {
    const decodedFilename = filename.includes('%')
      ? decodeURIComponent(filename)
      : filename;
    const properlyEncodedFilename = encodeURIComponent(decodedFilename);

    return `http://localhost:8081/user/uploads/profile_photos/${properlyEncodedFilename}?t=${Date.now()}`;
  } catch (error) {
    console.error('🚫 Error encoding filename:', error);
    return `http://localhost:8081/user/uploads/profile_photos/${filename}?t=${Date.now()}`;
  }
}


    // Store the computed photo URL to avoid recalculation
    get computedPhotoUrl(): string {
      // Always prioritize preview when available
      if (this.previewUrl) {
        return this.previewUrl;
      }

      // Use the stored photoUrl which includes proper cache busting
      if (this.photoUrl) {
        return this.photoUrl;
      }

      // Fallback to generating URL
      if (this.model?.photo) {
        return this.generatePhotoUrl(this.model.photo);
      }

      return 'assets/images/default.png';
    }

  getPhotoUrl(): string {
    if (this.model?.photo) {
      const encodedPhoto = encodeURIComponent(this.model.photo);
      return `http://localhost:8081/user/uploads/profile_photos/${encodedPhoto}?t=${new Date().getTime()}`;
    }
    return 'assets/images/default.png';
  }


    handleImageError(event: Event) {
      (event.target as HTMLImageElement).src = 'assets/images/default.png';
    }

    loadUserData(): void {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();

      if (currentUser) {
        this.model = { ...currentUser,
          // Ensure photo is properly encoded
          photo:currentUser.photo ? encodeURIComponent(currentUser.photo) : 'assets/images/default.png'
         };
        
     
    
      
        if (currentUser.photo) {
          this.photoUrl = this.generatePhotoUrl(currentUser.photo);
          console.log('🔍 Generated photo URL:', this.photoUrl);
        } else {
          this.photoUrl = 'assets/images/default.png';
        }    
        console.log('model inside loadUserData:', this.model);
      } else {
        console.error('No user data available');
      }

      this.isLoading = false;
    }

    onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length) {
        this.selectedFile = input.files[0];
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.previewUrl = e.target?.result as string;
          this.photoUrl = this.previewUrl; 
        };
        reader.readAsDataURL(this.selectedFile);
      }
    }

    uploadPhoto(): void {
      if (!this.selectedFile) {
        console.warn("⚠️ Aucun fichier sélectionné pour l'upload");
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error("❌ Aucun utilisateur connecté");
        return;
      }

      this.isLoading = true;

      this.authService.uploadPhoto(this.selectedFile).subscribe({
        next: (response) => {
          console.log("✅ Photo uploadée :", response.photoUrl);

          const filename = response.photoUrl // juste le nom du fichier

          const updatedUser = {
            ...currentUser,
            photo: filename
          };

          this.model = updatedUser;
          this.authService.setCurrentUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));

          // Clear browser cache for this image and force refresh
          this.clearImageCache(filename);
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error("❌ Erreur lors de l'upload :", error);
          this.isLoading = false;
        }
      });
    }

    save(form: NgForm) {
      if (form.invalid) return;

      this.isLoading = true;
      this.errorMessage = '';
      const userData = { ...this.model };

      console.log('User Data to Save:', userData); // Debug log
        
      this.authService.updateUser(this.model.idUser , userData).subscribe({
        next: (updatedUser) => {
          this.userUpdated.emit(updatedUser);
          this.isLoading = false;
          console.log('✅ FIN: isLoading = false (next)', this.isLoading);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Une erreur est survenue';
          this.isLoading = false;
        }
      });
    }

    

    // Method to clear image cache and force refresh
    private clearImageCache(filename: string): void {
      // Generate new timestamp only after upload
      
      // Store the timestamp for persistence across page reloads
      const currentUser = this.authService.getCurrentUser();
   
      
      // Clear the old cached image first
      this.previewUrl = null;
      
      // Force the browser to forget the old cached image
      const oldImageUrl = 'http://localhost:8081/user/uploads/profile_photos/' + 
                        (filename.includes('%') ? filename : encodeURIComponent(filename));
      
      // Create a temporary image to clear cache
      const tempImg = new Image();
      tempImg.src = oldImageUrl + '?clear=' + Date.now();
      
      // Update the photo URL with new timestamp
      const newImageUrl = this.generatePhotoUrl(filename);
      
      // Force the image element to reload
      const profileImg = document.querySelector('.profile-avatar') as HTMLImageElement;
      if (profileImg) {
        // Clear the src first to force a reload
        profileImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        
        // Set the new URL after a small delay
        setTimeout(() => {
          this.photoUrl = newImageUrl;
          profileImg.src = newImageUrl;
        }, 100);
      } else {
        this.photoUrl = newImageUrl;
      }
    }

    changePassword(): void {
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const username = this.authService.getUsername();
        
        this.isLoading = true;
        this.authService.changePassword({
          username: username, // Now guaranteed to be a string
          oldPassword: this.passwordData.oldPassword,
          newPassword: this.passwordData.newPassword
        }).subscribe({
          next: () => {
            alert('Password updated successfully!');
          },
          error: (error) => {
            console.error('Error:', error);
            alert(error.message || 'Password update failed');
            this.isLoading = false;
          }
        });
      } catch (error) {
        this.isLoading = false;
        alert(error instanceof Error ? error.message : 'Authentication error');
      }
    }
/* 
    // Method to manually clear cache (can be called from template)
    refreshPhoto(): void {
      if (this.model?.photo) {
        // Clear any existing preview
        this.previewUrl = null;
        
        // Generate new timestamp to bust cache
        
        // Store the timestamp
        const currentUser = this.authService.getCurrentUser();
       
        
        // Get the image element
        const img = document.querySelector('.profile-avatar') as HTMLImageElement;
        if (img) {
          // Clear the current src to force reload
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          
          // Set new URL with cache buster
          setTimeout(() => {
            this.photoUrl = this.generatePhotoUrl(this.model.photo);
            img.src = this.photoUrl;
          }, 50);
        } else {
          // Fallback if image element not found
          this.photoUrl = this.generatePhotoUrl(this.model.photo);
        }
      }
    } */

    getPasswordStrength() {
      if (!this.passwordData.newPassword) return 0;
      const strength = Math.min(this.passwordData.newPassword.length * 10, 100);
      return strength > 80 ? 100 : strength > 50 ? 80 : strength;
    }
  }