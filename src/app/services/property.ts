import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property as PropertyModel } from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class Property {

  private apiUrl = 'https://localhost:7299/api/Properties';

  constructor(private http: HttpClient) {}


  uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<{ imageUrl: string }>(
    'https://localhost:7299/api/ImageUpload',
    formData
  );
}

  getProperties(): Observable<PropertyModel[]> {
    return this.http.get<PropertyModel[]>(this.apiUrl);
  }

  getAllPropertiesForAdmin(): Observable<PropertyModel[]> {
    return this.http.get<PropertyModel[]>(
      `${this.apiUrl}/all`
    );
  }

  getPropertyById(id: number): Observable<PropertyModel> {
    return this.http.get<PropertyModel>(`${this.apiUrl}/${id}`);
  }

  getMyProperties(): Observable<PropertyModel[]> {
    return this.http.get<PropertyModel[]>(
      `${this.apiUrl}/my-properties`
    );
  }

  addProperty(property: any): Observable<PropertyModel> {
    return this.http.post<PropertyModel>(
      this.apiUrl,
      property
    );
  }

  updateProperty(
    id: number,
    property: any
  ): Observable<PropertyModel> {
    return this.http.put<PropertyModel>(
      `${this.apiUrl}/${id}`,
      property
    );
  }

  deleteProperty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  approveProperty(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  rejectProperty(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/reject`,
      {}
    );
  }

}