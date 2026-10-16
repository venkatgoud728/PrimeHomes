import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Favorite,
  FavoriteService
} from '../services/favorite.service';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-favorites.html',
  styleUrl: './my-favorites.css'
})
export class MyFavorites implements OnInit {

  // ==========================================
  // Favorites
  // ==========================================

  favorites: Favorite[] = [];

  loading = true;
  errorMessage = '';


  // ==========================================
  // Constructor
  // ==========================================

  constructor(
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // Page Load
  // ==========================================

  ngOnInit(): void {

    this.loadFavorites();

  }


  // ==========================================
  // Load My Favorites
  // ==========================================

  loadFavorites(): void {

    this.loading = true;
    this.errorMessage = '';

    this.favoriteService
      .getMyFavorites()
      .subscribe({

        next: (data) => {

          console.log(
            'My Favorites:',
            data
          );

          this.favorites = data;

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading favorites:',
            error
          );

          this.loading = false;
          this.errorMessage = 'Unable to load your saved homes. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // Remove Favorite
  // ==========================================

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

          alert(
            'Property removed from favorites.'
          );


          // Remove from UI immediately
          this.favorites =
            this.favorites.filter(
              favorite =>
                favorite.propertyId !== propertyId
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