import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Favorite {
  favoriteId: number;
  propertyId: number;
  title: string;
  description: string;
  propertyType: string;
  bhk: number;
  price: number;
  area: number;
  location: string;
  city: string;
  imageUrl?: string;
  status: string;
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private apiUrl = 'https://localhost:7299/api/Favorites';

  constructor(private http: HttpClient) {}

  // Add property to favorites
  addFavorite(propertyId: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      propertyId: propertyId
    });
  }

  // Get logged-in buyer's favorites
  getMyFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.apiUrl);
  }

  // Remove property from favorites
  removeFavorite(propertyId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${propertyId}`
    );
  }
}