import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';

@Component({
  selector: 'app-property-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css'
})
export class PropertyList implements OnInit {

  properties: Property[] = [];
  filteredProperties: Property[] = [];

  searchText = '';
  selectedPropertyType = '';
  selectedBhk = 0;
  maxPrice: number | null = null;

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.searchText = params['location'] || '';
      this.selectedPropertyType = params['propertyType'] || '';
      this.selectedBhk = Number(params['bhk']) || 0;

      this.loadProperties();

    });

  }

  loadProperties(): void {

    this.propertyService.getProperties().subscribe({

      next: (data) => {

        this.properties = data;

        console.log('Properties loaded:', data);

        this.applyFilters();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('Error loading properties:', error);

      }

    });

  }

  applyFilters(): void {

    const search = this.searchText.toLowerCase().trim();

    this.filteredProperties = this.properties.filter(property => {

      const matchesSearch =
        !search ||
        property.title.toLowerCase().includes(search) ||
        property.location.toLowerCase().includes(search) ||
        property.city.toLowerCase().includes(search);

      const matchesType =
        !this.selectedPropertyType ||
        property.propertyType === this.selectedPropertyType;

      const matchesBhk =
        !this.selectedBhk ||
        property.bhk === this.selectedBhk;

      const matchesPrice =
        !this.maxPrice ||
        property.price <= this.maxPrice;

      return (
        matchesSearch &&
        matchesType &&
        matchesBhk &&
        matchesPrice
      );

    });

  }

  clearFilters(): void {

    this.searchText = '';
    this.selectedPropertyType = '';
    this.selectedBhk = 0;
    this.maxPrice = null;

    this.filteredProperties = this.properties;

  }

}