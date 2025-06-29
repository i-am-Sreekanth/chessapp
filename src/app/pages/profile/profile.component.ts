import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  username: string = 'Gamer123';
  email: string = 'user@example.com'; // To be injected from AWS
  profileImageUrl: string | ArrayBuffer | null = null;
  defaultAvatar: string = 'assets/default-avatar.png';

  isEditingUsername: boolean = false;
  isDirty: boolean = false;

  toggleEdit(field: string) {
    if (field === 'username') {
      this.isEditingUsername = !this.isEditingUsername;
    }
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImageUrl = e.target?.result;
        this.markDirty();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  markDirty() {
    this.isDirty = true;
  }

  saveChanges() {
    console.log('Saving changes:', {
      username: this.username,
      profileImage: this.profileImageUrl
    });

    this.isDirty = false;
    this.isEditingUsername = false;
  }
}
