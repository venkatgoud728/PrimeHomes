import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  NotificationService,
  NotificationModel
} from '../services/notification';


@Component({
  selector: 'app-notifications',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './notifications.html',

  styleUrl: './notifications.css'
})


export class Notifications implements OnInit {

  notifications: NotificationModel[] = [];

  isLoading = true;


  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // Component Initialization
  // ==========================================

  ngOnInit(): void {

    this.loadNotifications();

  }


  // ==========================================
  // Load Notifications
  // ==========================================

  loadNotifications(): void {

    this.isLoading = true;


    this.notificationService
      .getNotifications()
      .subscribe({

        next: (data) => {

          console.log(
            'Notifications loaded:',
            data
          );


          this.notifications = [...data];


          console.log(
            'Notifications array:',
            this.notifications
          );


          this.isLoading = false;


          // Force Angular to update the UI
          this.cdr.detectChanges();


          console.log(
            'Loading finished:',
            this.isLoading
          );

        },


        error: (error) => {

          console.error(
            'Failed to load notifications:',
            error
          );


          this.notifications = [];


          this.isLoading = false;


          // Force Angular to update the UI
          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // Mark Notification As Read
  // ==========================================

  markAsRead(
    notification: NotificationModel
  ): void {

    // Already read
    if (notification.isRead) {

      return;

    }


    this.notificationService
      .markAsRead(
        notification.notificationId
      )
      .subscribe({

       next: () => {

  notification.isRead = true;

  // Tell navbar to refresh unread notification count
  this.notificationService
    .notifyUnreadCountChanged();

  this.cdr.detectChanges();

  console.log(
    'Notification marked as read:',
    notification.notificationId
  );
},


        error: (error) => {

          console.error(
            'Failed to mark notification as read:',
            error
          );

        }

      });

  }


  // ==========================================
  // Notification Date / Time
  // ==========================================

  getNotificationTime(
    createdDate: string
  ): string {

    return new Date(
      createdDate
    ).toLocaleString();

  }

}