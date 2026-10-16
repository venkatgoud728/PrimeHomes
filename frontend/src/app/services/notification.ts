import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';


export interface NotificationModel {

  notificationId: number;

  userId: number;

  title: string;

  message: string;

  type: string;

  isRead: boolean;

  relatedPropertyId?: number | null;

  createdDate: string;

}


@Injectable({
  providedIn: 'root'
})


export class NotificationService {

  private apiUrl =
    'https://localhost:7299/api/Notifications';


  // ==========================================
  // Notification count change event
  // ==========================================

  private unreadCountChanged =
    new Subject<void>();

  unreadCountChanged$ =
    this.unreadCountChanged.asObservable();


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // Get all notifications
  // ==========================================

  getNotifications():
    Observable<NotificationModel[]> {

    return this.http.get<NotificationModel[]>(
      this.apiUrl
    );

  }


  // ==========================================
  // Get unread notifications
  // ==========================================

  getUnreadNotifications():
    Observable<NotificationModel[]> {

    return this.http.get<NotificationModel[]>(
      `${this.apiUrl}/unread`
    );

  }


  // ==========================================
  // Get unread notification count
  // ==========================================

  getUnreadCount():
    Observable<{ count: number }> {

    return this.http.get<{ count: number }>(
      `${this.apiUrl}/unread-count`
    );

  }


  // ==========================================
  // Mark notification as read
  // ==========================================

  markAsRead(
    notificationId: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );

  }


  // ==========================================
  // Notify navbar to refresh unread count
  // ==========================================

  notifyUnreadCountChanged(): void {

    this.unreadCountChanged.next();

  }

}