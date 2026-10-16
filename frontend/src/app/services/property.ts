import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property as PropertyModel, PropertyImage} from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class Property {

  private apiUrl = 'https://localhost:7299/api/Properties';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Upload Single Main Property Image
  // ==========================================
  uploadImage(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(
      'https://localhost:7299/api/ImageUpload',
      formData
    );
  }


  // ==========================================
  // Upload Multiple Property Gallery Images
  // ==========================================
  uploadPropertyImages(
    propertyId: number,
    files: File[]
  ) {

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post(
      `https://localhost:7299/api/PropertyImages/upload/${propertyId}`,
      formData
    );
  }


  // ==========================================
  // Get All Properties
  // ==========================================
  getProperties(): Observable<PropertyModel[]> {

    return this.http.get<PropertyModel[]>(
      this.apiUrl
    );
  }


  // ==========================================
  // Get All Properties For Admin
  // ==========================================
  getAllPropertiesForAdmin(): Observable<PropertyModel[]> {

    return this.http.get<PropertyModel[]>(
      `${this.apiUrl}/all`
    );
  }


  // ==========================================
  // Get Property By ID
  // ==========================================
  getPropertyById(
    id: number
  ): Observable<PropertyModel> {

    return this.http.get<PropertyModel>(
      `${this.apiUrl}/${id}`
    );
  }


  // ==========================================
  // Get My Properties
  // ==========================================
  getMyProperties(): Observable<PropertyModel[]> {

    return this.http.get<PropertyModel[]>(
      `${this.apiUrl}/my-properties`
    );
  }


  // ==========================================
  // Add Property
  // ==========================================
  addProperty(
    property: any
  ): Observable<PropertyModel> {

    return this.http.post<PropertyModel>(
      this.apiUrl,
      property
    );
  }


  // ==========================================
  // Update Property
  // ==========================================
  updateProperty(
    id: number,
    property: any
  ): Observable<PropertyModel> {

    return this.http.put<PropertyModel>(
      `${this.apiUrl}/${id}`,
      property
    );
  }


  // ==========================================
  // Delete Property
  // ==========================================
  deleteProperty(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }


  // ==========================================
  // Approve Property
  // ==========================================
  approveProperty(
    id: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }


  // ==========================================
  // Reject Property
  // ==========================================
  rejectProperty(
    id: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/reject`,
      {}
    );
  }

 // ==========================================
// Get All Gallery Images For A Property
// ==========================================
getPropertyImages(
  propertyId: number
): Observable<PropertyImage[]> {

  return this.http.get<PropertyImage[]>(
    `https://localhost:7299/api/PropertyImages/${propertyId}`
  );
}


// ==========================================
// Delete Property Gallery Image
// ==========================================
deletePropertyImage(
  imageId: number
): Observable<any> {

  return this.http.delete(
    `https://localhost:7299/api/PropertyImages/${imageId}`
  );
}

}