import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { Property as PropertyService } from '../services/property';

@Component({
  selector: 'app-add-property',
  imports: [FormsModule, CommonModule],
  templateUrl: './add-property.html',
  styleUrl: './add-property.css'
})
export class AddProperty implements OnInit {

  isEditMode = false;
  propertyId = 0;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  property = {
    title: '',
    description: '',
    propertyType: '',
    bhk: 0,
    price: 0,
    area: 0,
    location: '',
    city: '',
    imageUrl: ''
  };

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      if (params['id']) {

        this.isEditMode = true;
        this.propertyId = Number(params['id']);

        console.log('Edit Property ID:', this.propertyId);

        this.loadProperty();

      }

    });

  }

  loadProperty(): void {

    this.propertyService.getPropertyById(this.propertyId).subscribe({

      next: (data) => {

        console.log('Property loaded:', JSON.stringify(data, null, 2));

        this.property.title = data.title;
        this.property.description = data.description;
        this.property.propertyType = data.propertyType;
        this.property.bhk = data.bhk;
        this.property.price = data.price;
        this.property.area = data.area;
        this.property.location = data.location;
        this.property.city = data.city;
        this.property.imageUrl = data.imageUrl || '';

        // Show existing image while editing
        this.imagePreview = this.property.imageUrl || null;

        this.cdr.detectChanges();

        console.log('Form property after assignment:', this.property);

      },

      error: (error) => {

        console.error('Error loading property:', error);

        alert('Unable to load property.');

      }

    });

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      this.selectedFile = input.files[0];

      console.log('Selected file:', this.selectedFile.name);

      const reader = new FileReader();

      reader.onload = () => {

        this.imagePreview = reader.result as string;

      };

      reader.readAsDataURL(this.selectedFile);

    }

  }

  uploadSelectedImage(): void {

    if (!this.selectedFile) {

      // No new image selected
      this.addOrUpdateProperty();

      return;

    }

    this.propertyService.uploadImage(this.selectedFile).subscribe({

      next: (response) => {

        console.log('Image uploaded:', response.imageUrl);

        this.property.imageUrl = response.imageUrl;

        this.addOrUpdateProperty();

      },

      error: (error) => {

        console.error('Image upload failed:', error);

        alert('Unable to upload image.');

      }

    });

  }

  addOrUpdateProperty(): void {

    console.log('Sending property:', this.property);

    if (this.isEditMode) {

      this.propertyService.updateProperty(
        this.propertyId,
        this.property
      ).subscribe({

        next: (response) => {

          console.log('Property updated successfully:', response);

          alert('Property updated successfully!');

          this.router.navigate(['/my-properties']);

        },

        error: (error) => {

          console.error('Error updating property:', error);

          alert('Unable to update property.');

        }

      });

    } else {

      this.propertyService.addProperty(this.property).subscribe({

        next: (response) => {

          console.log('Property added successfully:', response);

          alert('Property added successfully! Waiting for Admin approval.');

          this.router.navigate(['/my-properties']);

        },

        error: (error) => {

          console.error('Error adding property:', error);

          alert('Unable to add property.');

        }

      });

    }

  }

}