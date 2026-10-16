import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Favorite,
  FavoriteService
} from '../services/favorite.service';

import {
  Inquiry
} from '../models/inquiry';

import {
  InquiryService
} from '../services/inquiry';


@Component({
  selector: 'app-buyer-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './buyer-dashboard.html',

  styleUrl: './buyer-dashboard.css'
})


export class BuyerDashboard implements OnInit {


  // =====================================================
  // BUYER INFORMATION
  // =====================================================

  buyerName: string =
    localStorage.getItem('name') || 'Buyer';


  // =====================================================
  // FAVORITES
  // =====================================================

  favorites: Favorite[] = [];

  totalFavorites = 0;
  isLoadingFavorites = true;
  favoritesError = '';


  // =====================================================
  // INQUIRIES
  // =====================================================

  inquiries: Inquiry[] = [];

  totalInquiries = 0;
  isLoadingInquiries = true;
  inquiriesError = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private favoriteService: FavoriteService,

    private inquiryService: InquiryService,

    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // PAGE LOAD
  // =====================================================

  ngOnInit(): void {

    this.loadFavorites();

    this.loadInquiries();

  }


  // =====================================================
  // LOAD FAVORITES
  // =====================================================

  loadFavorites(): void {

    this.isLoadingFavorites = true;
    this.favoritesError = '';

    this.favoriteService
      .getMyFavorites()
      .subscribe({



        next: (data) => {

          console.log(
            'Buyer Favorites:',
            data
          );

          this.favorites = data;


          

          this.totalFavorites =
            data.length;

          this.isLoadingFavorites = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading buyer favorites:',
            error
          );

          this.isLoadingFavorites = false;
          this.favoritesError = 'Unable to load your saved homes. Please try again.';
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD INQUIRIES
  // =====================================================

  loadInquiries(): void {

    this.isLoadingInquiries = true;
    this.inquiriesError = '';

    this.inquiryService
      .getMyInquiries()
      .subscribe({

        next: (data) => {

          console.log(
            'Buyer Inquiries:',
            data
          );

          this.inquiries = data;

          this.totalInquiries =
            data.length;

          this.isLoadingInquiries = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading buyer inquiries:',
            error
          );

          this.isLoadingInquiries = false;
          this.inquiriesError = 'Unable to load your inquiries. Please try again.';
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // GET INQUIRY STATUS
  // =====================================================

  getInquiryStatus(status?: string): string {

    if (!status || status.trim() === '') {

      return 'New';

    }


    const normalizedStatus =
      status.trim().toLowerCase();


    switch (normalizedStatus) {

      case 'new':

        return 'New';


      case 'pending':

        return 'Pending';


      case 'responded':

        return 'Responded';


      case 'rejected':

        return 'Rejected';


      default:

        return status;

    }

  }


  // =====================================================
  // GET INQUIRY STATUS CSS CLASS
  // =====================================================

  getInquiryStatusClass(status?: string): string {

    const normalizedStatus =
      this.getInquiryStatus(status).toLowerCase();


    switch (normalizedStatus) {

      case 'new':

        return 'status-new';


      case 'pending':

        return 'status-pending';


      case 'responded':

        return 'status-responded';


      case 'rejected':

        return 'status-rejected';


      default:

        return 'status-new';

    }

  }


  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  removeFavorite(propertyId: number): void {

    const confirmed = confirm(
      'Are you sure you want to remove this property from favorites?'
    );


    if (!confirmed) {

      return;

    }


    this.favoriteService
      .removeFavorite(propertyId)
      .subscribe({

        next: (response) => {

          console.log(
            'Favorite removed:',
            response
          );


          this.favorites =
            this.favorites.filter(
              favorite =>
                favorite.propertyId !== propertyId
            );


          this.totalFavorites =
            this.favorites.length;


          alert(
            'Property removed from favorites.'
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

  }

}