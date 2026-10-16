import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';
import { FavoriteService } from '../services/favorite.service';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyList implements OnInit {

  // ==========================================
  // Properties
  // ==========================================

  properties: Property[] = [];

  filteredProperties: Property[] = [];
  isLoadingProperties = false;
  propertiesError = '';


  // ==========================================
// Search and Filters
// ==========================================

searchText = '';

selectedPropertyType = '';

selectedBhk = 0;

minPrice: number | null = null;

maxPrice: number | null = null;

minArea: number | null = null;

maxArea: number | null = null;

// Sorting
selectedSort = '';


  // ==========================================
  // Favorites
  // ==========================================

  favoritePropertyIds: number[] = [];

  userRole = '';


  // ==========================================
  // Constructor
  // ==========================================

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private favoriteService: FavoriteService,
    private compareService: CompareService
  ) {}


  // ==========================================
  // Page Load
  // ==========================================

  ngOnInit(): void {

    this.userRole =
      localStorage.getItem('role') || '';

    // Load existing favorites only for Buyer
    if (this.userRole === 'Buyer') {
      this.loadMyFavorites();
    }


    this.route.queryParams.subscribe(params => {

      this.searchText =
        params['location'] || '';

      this.selectedPropertyType =
        params['propertyType'] || '';

      this.selectedBhk =
        Number(params['bhk']) || 0;

      this.loadProperties();

    });

  }


  // ==========================================
  // Load Properties
  // ==========================================

  loadProperties(): void {

    this.isLoadingProperties = true;
    this.propertiesError = '';

    this.propertyService.getProperties().subscribe({

      next: (data) => {

        this.properties = data;
        this.isLoadingProperties = false;

        console.log(
          'Properties loaded:',
          data
        );

        this.applyFilters();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error loading properties:',
          error
        );

        this.isLoadingProperties = false;
        this.propertiesError =
          'Properties could not be loaded. Please try again.';
        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // Load My Favorites
  // ==========================================

  loadMyFavorites(): void {

    this.favoriteService
      .getMyFavorites()
      .subscribe({

        next: (favorites) => {

          console.log(
            'My Favorites:',
            favorites
          );


          this.favoritePropertyIds =
            favorites.map(
              favorite => favorite.propertyId
            );


          console.log(
            'Favorite Property IDs:',
            this.favoritePropertyIds
          );


          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading favorites:',
            error
          );

        }

      });

  }


  // ==========================================
  // Check if Property is Favorite
  // ==========================================

  isFavorite(propertyId: number): boolean {

    return this.favoritePropertyIds
      .includes(propertyId);

  }


  // ==========================================
  // Toggle Favorite
  // ==========================================


  isInCompare(propertyId: number): boolean {
  return this.compareService.isInCompare(propertyId);
}

toggleCompare(property: Property): void {

  if (this.isInCompare(property.propertyId)) {

    this.compareService.removeFromCompare(property.propertyId);

    alert('Property removed from comparison.');

    this.cdr.detectChanges();

    return;
  }

  const added = this.compareService.addToCompare(property);

  if (!added) {
    alert('You can compare a maximum of 3 properties.');
    return;
  }

  alert('Property added to comparison.');

  this.cdr.detectChanges();
}


  toggleFavorite(propertyId: number): void {


    

    // Only Buyers can use Favorites
    if (this.userRole !== 'Buyer') {

      alert(
        'Please login as a Buyer to add favorites.'
      );

      return;

    }



    


    // ==========================================
    // Remove Favorite
    // ==========================================

    if (this.isFavorite(propertyId)) {

      this.favoriteService
        .removeFavorite(propertyId)
        .subscribe({

          next: (response) => {

            console.log(
              'Favorite removed:',
              response
            );


            this.favoritePropertyIds =
              this.favoritePropertyIds.filter(
                id => id !== propertyId
              );


            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              'Error removing favorite:',
              error
            );

            alert(
              'Unable to remove favorite.'
            );

          }

        });

      return;

    }


    // ==========================================
    // Add Favorite
    // ==========================================

    this.favoriteService
      .addFavorite(propertyId)
      .subscribe({

        next: (response) => {

          console.log(
            'Favorite added:',
            response
          );


          this.favoritePropertyIds.push(
            propertyId
          );


          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error adding favorite:',
            error
          );


          if (error.status === 400) {

            alert(
              error.error?.message ||
              'Property is already in your favorites.'
            );

          }

          else if (error.status === 401) {

            alert(
              'Please login as a Buyer to add favorites.'
            );

          }

          else {

            alert(
              'Unable to add property to favorites.'
            );

          }

        }

      });

  }


  // ==========================================
  // Apply Filters
  // ==========================================

 applyFilters(): void {

  const search = this.searchText.toLowerCase().trim();

  this.filteredProperties = this.properties.filter(property => {

    // Search
    const matchesSearch =
      !search ||
      property.title.toLowerCase().includes(search) ||
      property.location.toLowerCase().includes(search) ||
      property.city.toLowerCase().includes(search);

    // Property Type
    const matchesType =
      !this.selectedPropertyType ||
      property.propertyType === this.selectedPropertyType;

    // BHK
    const matchesBhk =
      !this.selectedBhk ||
      property.bhk === this.selectedBhk;

    // Minimum Price
    const matchesMinPrice =
      !this.minPrice ||
      property.price >= this.minPrice;

    // Maximum Price
    const matchesMaxPrice =
      !this.maxPrice ||
      property.price <= this.maxPrice;

    // Minimum Area
    const matchesMinArea =
      !this.minArea ||
      property.area >= this.minArea;

    // Maximum Area
    const matchesMaxArea =
      !this.maxArea ||
      property.area <= this.maxArea;

    return (
      matchesSearch &&
      matchesType &&
      matchesBhk &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesMinArea &&
      matchesMaxArea
    );
  });

  // Sorting
  if (this.selectedSort === 'priceLow') {

    this.filteredProperties.sort(
      (a, b) => a.price - b.price
    );

  } else if (this.selectedSort === 'priceHigh') {

    this.filteredProperties.sort(
      (a, b) => b.price - a.price
    );

  } else if (this.selectedSort === 'areaLow') {

    this.filteredProperties.sort(
      (a, b) => a.area - b.area
    );

  } else if (this.selectedSort === 'areaHigh') {

    this.filteredProperties.sort(
      (a, b) => b.area - a.area
    );

  } else if (this.selectedSort === 'newest') {

    this.filteredProperties.sort(
      (a, b) =>
        new Date(b.createdDate).getTime() -
        new Date(a.createdDate).getTime()
    );
  }
}


  // ==========================================
  // Clear Filters
  // ==========================================

  clearFilters(): void {

  this.searchText = '';

  this.selectedPropertyType = '';

  this.selectedBhk = 0;

  this.minPrice = null;

  this.maxPrice = null;

  this.minArea = null;

  this.maxArea = null;

  this.selectedSort = '';

  this.filteredProperties = this.properties;

  this.applyFilters();
}

}