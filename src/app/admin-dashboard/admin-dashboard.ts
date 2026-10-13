import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';
import { PropertyBadgeService } from '../services/property-badge';

import {
  ContactRequestService,
  ContactRequestAdmin
} from '../services/contact-request.service';


@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  // ==========================================
  // PROPERTIES
  // ==========================================

  properties: Property[] = [];


  // ==========================================
  // CALLBACK REQUESTS
  // ==========================================

  contactRequests: ContactRequestAdmin[] = [];


  // ==========================================
  // CALLBACK SEARCH & FILTERS
  // ==========================================

  filteredContactRequests: ContactRequestAdmin[] = [];

  callbackSearchText: string = '';

  callbackStatusFilter: string = '';

  callbackInterestFilter: string = '';

  callbackDateFilter: string = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private propertyService: PropertyService,
    private propertyBadgeService: PropertyBadgeService,
    private contactRequestService: ContactRequestService,
    private cdr: ChangeDetectorRef
  ) {
  }


  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {

    this.loadProperties();

    this.loadContactRequests();

  }


  // ==========================================
  // CALLBACK REQUEST COUNTS
  // ==========================================

  get totalContactRequests(): number {

    return this.contactRequests.length;

  }


  get newContactRequests(): number {

    return this.contactRequests.filter(
      request => request.status === 'New'
    ).length;

  }


  get contactedContactRequests(): number {

    return this.contactRequests.filter(
      request => request.status === 'Contacted'
    ).length;

  }


  get closedContactRequests(): number {

    return this.contactRequests.filter(
      request => request.status === 'Closed'
    ).length;

  }


  // ==========================================
  // LOAD ALL PROPERTIES
  // ==========================================

  loadProperties(): void {

    this.propertyService
      .getAllPropertiesForAdmin()
      .subscribe({

        next: (data) => {

          this.properties = data;

          console.log(
            'All Properties:',
            data
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading properties:',
            error
          );

        }

      });

  }


  // ==========================================
  // APPROVE PROPERTY
  // ==========================================

  approveProperty(
    property: Property
  ): void {

    this.propertyService
      .approveProperty(
        property.propertyId
      )
      .subscribe({

        next: () => {

          alert(
            'Property approved successfully.'
          );

          this.loadProperties();

        },

        error: (error) => {

          console.error(
            'Error approving property:',
            error
          );

          alert(
            'Unable to approve property.'
          );

        }

      });

  }


  // ==========================================
  // REJECT PROPERTY
  // ==========================================

  rejectProperty(
    property: Property
  ): void {

    this.propertyService
      .rejectProperty(
        property.propertyId
      )
      .subscribe({

        next: () => {

          alert(
            'Property rejected successfully.'
          );

          this.loadProperties();

        },

        error: (error) => {

          console.error(
            'Error rejecting property:',
            error
          );

          alert(
            'Unable to reject property.'
          );

        }

      });

  }


  // ==========================================
  // UPDATE PROPERTY BADGE
  // ==========================================

  updateBadge(
    property: Property,
    badge: string | null
  ): void {

    this.propertyBadgeService
      .updateBadge(
        property.propertyId,
        badge
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Badge updated:',
            response
          );

          property.badge =
            response.badge;

          alert(
            response.badge
              ? `Property badge updated to ${response.badge}.`
              : 'Property badge removed.'
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error updating property badge:',
            error
          );

          alert(
            error.error?.message ||
            'Unable to update property badge.'
          );

        }

      });

  }


  // ==========================================
  // LOAD CALLBACK REQUESTS
  // ==========================================

  loadContactRequests(): void {

    this.contactRequestService
      .getContactRequests()
      .subscribe({

        next: (data) => {

          this.contactRequests = data;

          this.filteredContactRequests = [...data];

          console.log(
            'Contact Requests:',
            data
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading contact requests:',
            error
          );

        }

      });

  }


  // ==========================================
  // FILTER CALLBACK REQUESTS
  // ==========================================

  filterContactRequests(): void {

    const searchText =
      this.callbackSearchText
        .trim()
        .toLowerCase();


    this.filteredContactRequests =
      this.contactRequests.filter(request => {


        // ------------------------------
        // SEARCH
        // ------------------------------

        const matchesSearch =
          !searchText ||
          request.fullName
            ?.toLowerCase()
            .includes(searchText) ||
          request.email
            ?.toLowerCase()
            .includes(searchText) ||
          request.phoneNumber
            ?.toLowerCase()
            .includes(searchText);


        // ------------------------------
        // STATUS FILTER
        // ------------------------------

        const matchesStatus =
          !this.callbackStatusFilter ||
          request.status === this.callbackStatusFilter;


        // ------------------------------
        // INTEREST FILTER
        // ------------------------------

        const matchesInterest =
          !this.callbackInterestFilter ||
          request.interestedIn === this.callbackInterestFilter;


        // ------------------------------
        // DATE FILTER
        // ------------------------------

        let matchesDate = true;


        if (this.callbackDateFilter) {

          const requestDate =
            new Date(request.createdDate)
              .toISOString()
              .split('T')[0];

          matchesDate =
            requestDate === this.callbackDateFilter;

        }


        // ------------------------------
        // FINAL RESULT
        // ------------------------------

        return (
          matchesSearch &&
          matchesStatus &&
          matchesInterest &&
          matchesDate
        );

      });


    this.cdr.detectChanges();

  }


  // ==========================================
  // CLEAR CALLBACK FILTERS
  // ==========================================

  clearContactRequestFilters(): void {

    this.callbackSearchText = '';

    this.callbackStatusFilter = '';

    this.callbackInterestFilter = '';

    this.callbackDateFilter = '';


    this.filteredContactRequests =
      [...this.contactRequests];


    this.cdr.detectChanges();

  }


  // ==========================================
  // UPDATE CALLBACK REQUEST STATUS
  // ==========================================

  updateContactRequestStatus(
    request: ContactRequestAdmin,
    status: string
  ): void {

    this.contactRequestService
      .updateStatus(
        request.contactRequestId,
        status
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Contact request status updated:',
            response
          );

          request.status = status;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error updating contact request status:',
            error
          );

          alert(
            error.error?.message ||
            'Unable to update callback request status.'
          );

        }

      });

  }

}