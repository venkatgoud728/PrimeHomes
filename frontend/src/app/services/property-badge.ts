import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyBadgeService {

  private apiUrl = 'https://localhost:7299/api/Properties';

  constructor(private http: HttpClient) {}

  updateBadge(
  propertyId: number,
  badge: string | null
): Observable<any> {

  return this.http.put(
    `${this.apiUrl}/${propertyId}/badge`,
    {
      badge: badge
    }
  );
}
}