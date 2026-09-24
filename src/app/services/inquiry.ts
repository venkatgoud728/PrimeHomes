import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Inquiry } from '../models/inquiry';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {

  private apiUrl = 'https://localhost:7299/api/Inquiries';

  constructor(private http: HttpClient) {}

  addInquiry(inquiry: Inquiry): Observable<Inquiry> {
    return this.http.post<Inquiry>(this.apiUrl, inquiry);
  }

  getMyInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(
      `${this.apiUrl}/my-inquiries`
    );
  }

  getOwnerInquiries(): Observable<Inquiry[]> {
  return this.http.get<Inquiry[]>(
    this.apiUrl
  );
}

  updateInquiryStatus(
    inquiryId: number,
    status: string
  ): Observable<Inquiry> {

    return this.http.put<Inquiry>(
      `${this.apiUrl}/${inquiryId}`,
      {
        status: status
      }
    );
  }

}