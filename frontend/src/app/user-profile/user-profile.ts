import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UserProfileService,
  UserProfile,
  MyProfileResponse
} from '../services/user-profile';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit {

  profile: UserProfile = {};

  userId = 0;
  name = '';
  email = '';
  phone = '';
  role = '';

  isLoading = false;
  isSaving = false;

  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;
  isUploadingImage = false;

  constructor(
    private userProfileService: UserProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {

    this.isLoading = true;

    this.userProfileService.getMyProfile().subscribe({
      next: (response: MyProfileResponse) => {

        console.log('My Profile:', response);

        this.userId = response.userId;
        this.name = response.name;
        this.email = response.email;
        this.phone = response.phone || '';
        this.role = response.role;

        this.profile = response.profile || {};

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Error loading profile:', error);

        this.isLoading = false;

        alert('Unable to load your profile.');

        this.cdr.detectChanges();
      }
    });
  }


  saveProfile(): void {

    this.isSaving = true;

    this.userProfileService
      .updateProfile(this.profile)
      .subscribe({

        next: (response) => {

          console.log('Profile saved:', response);

          this.profile = response;

          this.isSaving = false;

          alert('Profile updated successfully.');

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Error saving profile:', error);

          this.isSaving = false;

          alert(
            error.error?.message ||
            'Unable to update profile.'
          );

          this.cdr.detectChanges();
        }
      });
  }


  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Allowed image types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      alert(
        'Please select a JPG, JPEG, PNG, or WEBP image.'
      );

      input.value = '';
      this.selectedImage = null;
      this.imagePreviewUrl = null;

      return;
    }

    // Maximum 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {

      alert(
        'Profile image must be smaller than 5 MB.'
      );

      input.value = '';
      this.selectedImage = null;
      this.imagePreviewUrl = null;

      return;
    }

    this.selectedImage = file;

    this.imagePreviewUrl = URL.createObjectURL(file);

    console.log('Selected image:', file);
  }


  uploadProfileImage(): void {

    if (!this.selectedImage) {
      alert('Please select an image first.');
      return;
    }

    this.isUploadingImage = true;

    this.userProfileService
      .uploadProfileImage(this.selectedImage)
      .subscribe({

        next: (response) => {

          console.log('Image uploaded:', response);

          this.profile.profileImageUrl = response.imageUrl;

          this.isUploadingImage = false;
          this.selectedImage = null;
          this.imagePreviewUrl = null;

          alert('Profile image uploaded successfully.');

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Image upload error:', error);

          this.isUploadingImage = false;

          alert(
            error.error?.message ||
            'Unable to upload profile image.'
          );

          this.cdr.detectChanges();
        }
      });
  }

}