import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  userProfileId?: number;
  userId?: number;

  profileImageUrl?: string;

  city?: string;
  state?: string;

  bio?: string;

  companyName?: string;

  preferredCity?: string;
  preferredPropertyType?: string;
  preferredBHK?: number;

  minBudget?: number;
  maxBudget?: number;

  updatedDate?: string;
}

export interface MyProfileResponse {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile?: UserProfile | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private apiUrl = 'https://localhost:7299/api/UserProfiles';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<MyProfileResponse> {
    return this.http.get<MyProfileResponse>(
      `${this.apiUrl}/me`
    );
  }

  createProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.post<UserProfile>(
      this.apiUrl,
      profile
    );
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      this.apiUrl,
      profile
    );
  }

uploadProfileImage(file: File): Observable<any> {
  const formData = new FormData();

  formData.append('file', file);

  return this.http.post(
    `${this.apiUrl}/upload-image`,
    formData
  );
}

}