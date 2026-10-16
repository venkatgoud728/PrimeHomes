import { ContactRequest } from '../contact-request/contact-request';
import { Chatbot } from '../chatbot/chatbot';

import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';


@Component({
  selector: 'app-home',

  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    ContactRequest,
    Chatbot
  ],

  templateUrl: './home.html',
  styleUrl: './home.css'
})


export class Home implements OnInit {

  searchLocation = '';
  selectedPropertyType = '';
  selectedBhk = 0;

  featuredProperties: Property[] = [];

  totalProperties = 0;
  approvedProperties = 0;
  citiesCovered = 0;
  isLoadingFeatured = false;
  featuredPropertiesError = '';


  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadFeaturedProperties();

  }


  searchProperties(): void {

    this.router.navigate(['/properties'], {

      queryParams: {

        location: this.searchLocation.trim(),

        propertyType: this.selectedPropertyType,

        bhk: this.selectedBhk || ''

      }

    });

  }


  loadFeaturedProperties(): void {

    this.isLoadingFeatured = true;
    this.featuredPropertiesError = '';

    this.propertyService.getProperties().subscribe({

      next: (data) => {

        const uniqueImageProperties: Property[] = [];

        const usedImages = new Set<string>();


        for (const property of data) {

          const imageUrl = property.imageUrl || '';


          if (!usedImages.has(imageUrl)) {

            usedImages.add(imageUrl);

            uniqueImageProperties.push(property);

          }


          if (uniqueImageProperties.length === 6) {

            break;

          }

        }


        this.featuredProperties = uniqueImageProperties;
        this.isLoadingFeatured = false;


        this.totalProperties = data.length;


        this.approvedProperties = data.filter(

          property => property.status === 'Approved'

        ).length;


        const cities = data

          .map(property => property.city.trim().toLowerCase());


        this.citiesCovered = new Set(cities).size;


        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'Error loading featured properties:',
          error
        );

        this.isLoadingFeatured = false;
        this.featuredPropertiesError =
          'We couldn’t load featured properties. Please try again.';
        this.cdr.detectChanges();

      }

    });

  }

}