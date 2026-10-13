import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { NotificationService } from './services/notification';


@Component({
  selector: 'app-root',

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './app.html',

  styleUrl: './app.css'
})


export class App {

  menuOpen = false;

  unreadNotificationCount = 0;


 constructor(
  private router: Router,
  private notificationService: NotificationService
) {

  this.loadUnreadNotificationCount();

  // Refresh navbar notification count whenever
  // a notification is marked as read
  this.notificationService
    .unreadCountChanged$
    .subscribe(() => {

      this.loadUnreadNotificationCount();

    });

}


  // ==========================================
  // Check Login
  // ==========================================

  isLoggedIn(): boolean {

    return !!localStorage.getItem('token');

  }


  // ==========================================
  // Get User Role
  // ==========================================

  getUserRole(): string {

    return localStorage.getItem('role') || '';

  }


  // ==========================================
  // Load Unread Notification Count
  // ==========================================

  loadUnreadNotificationCount(): void {

    if (!this.isLoggedIn()) {

      this.unreadNotificationCount = 0;

      return;

    }


    this.notificationService
      .getUnreadCount()
      .subscribe({

        next: (response) => {

          this.unreadNotificationCount =
            response.count;

        },

        error: (error) => {

          console.error(
            'Notification count error:',
            error
          );

          this.unreadNotificationCount = 0;

        }

      });

  }


  // ==========================================
  // Open Notifications
  // ==========================================

  openNotifications(): void {

    this.router.navigate(['/notifications']);

  }


  // ==========================================
  // Logout
  // ==========================================

  logout(): void {

    localStorage.clear();

    this.unreadNotificationCount = 0;

    this.router.navigate(['/login']);

  }


  // ==========================================
  // Mobile Menu
  // ==========================================

  toggleMenu(): void {

    this.menuOpen = !this.menuOpen;

  }

}