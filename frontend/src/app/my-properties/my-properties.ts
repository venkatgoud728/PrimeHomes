import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';

@Component({
  selector: 'app-my-properties',
  imports: [CommonModule],
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.css'
})
export class MyProperties implements OnInit {

  properties: Property[] = [];
  isLoading = false;
  loadError = '';

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadMyProperties();
  }

  loadMyProperties(): void {

    this.isLoading = true;
    this.loadError = '';

    this.propertyService.getMyProperties().subscribe({

      next: (data) => {

        this.properties = data;
        this.isLoading = false;

        console.log('My Properties:', data);

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Error loading my properties:', error);
        this.isLoading = false;
        this.loadError = 'Your properties could not be loaded. Please try again.';
        this.cdr.detectChanges();

      }

    });

  }

  editProperty(property: Property): void {

    console.log('Editing property:', property);

    this.router.navigate(
      ['/add-property'],
      {
        queryParams: {
          id: property.propertyId
        }
      }
    );

  }


  deleteProperty(property: Property): void {

  const confirmed = confirm(
    `Are you sure you want to delete "${property.title}"?`
  );

  if (!confirmed) {
    return;
  }

  this.propertyService.deleteProperty(property.propertyId).subscribe({

    next: () => {

      console.log('Property deleted successfully');

      alert('Property deleted successfully.');

      this.loadMyProperties();

    },

    error: (error) => {

      console.error('Error deleting property:', error);

      alert('Unable to delete property.');

    }

  });

}

}