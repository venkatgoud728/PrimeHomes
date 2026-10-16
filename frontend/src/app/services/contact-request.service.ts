import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// ==========================================
// CONTACT REQUEST MODEL
// ==========================================

export interface ContactRequest {

  fullName: string;

  email: string;

  phoneNumber: string;

  interestedIn: string;

  message: string;

  userId?: number | null;

  propertyId?: number | null;

}


// ==========================================
// ADMIN CONTACT REQUEST MODEL
// ==========================================

export interface ContactRequestAdmin {

  contactRequestId: number;

  userId?: number | null;

  propertyId?: number | null;

  fullName: string;

  email: string;

  phoneNumber: string;

  interestedIn: string;

  message: string;

  status: string;

  createdDate: string;

}


// ==========================================
// CONTACT REQUEST SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class ContactRequestService {

  private apiUrl =
    'https://localhost:7299/api/ContactRequests';


  constructor(
    private http: HttpClient
  ) {
  }


  // ==========================================
  // SUBMIT CALLBACK REQUEST
  // ==========================================

  submitContactRequest(
    request: ContactRequest
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      request
    );

  }


  // ==========================================
  // ADMIN - GET ALL CALLBACK REQUESTS
  // ==========================================

  getContactRequests():
    Observable<ContactRequestAdmin[]> {

    return this.http.get<ContactRequestAdmin[]>(
      this.apiUrl
    );

  }


  // ==========================================
  // ADMIN - GET SINGLE CALLBACK REQUEST
  // ==========================================

  getContactRequest(
    id: number
  ): Observable<ContactRequestAdmin> {

    return this.http.get<ContactRequestAdmin>(
      `${this.apiUrl}/${id}`
    );

  }


  // ==========================================
  // ADMIN - UPDATE REQUEST STATUS
  // ==========================================

  updateStatus(
    id: number,
    status: string
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}/status`,
      JSON.stringify(status),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  }

}