import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://localhost:7299/api/Auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/register`,
      user
    );
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      user
    );
  }
}