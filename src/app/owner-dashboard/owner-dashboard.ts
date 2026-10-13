import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';

import { Inquiry } from '../models/inquiry';
import { InquiryService } from '../services/inquiry';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css'
})
export class OwnerDashboard implements OnInit {

  // ==========================================
  // Owner Information
  // ==========================================

  ownerName: string =
    localStorage.getItem('name') || 'Owner';


  // ==========================================
  // Properties
  // ==========================================

  properties: Property[] = [];

  totalProperties = 0;

  approvedProperties = 0;

  pendingProperties = 0;

  rejectedProperties = 0;


  // ==========================================
  // Inquiries
  // ==========================================

  inquiries: Inquiry[] = [];

  totalInquiries = 0;


  // ==========================================
  // Constructor
  // ==========================================

  constructor(
    private propertyService: PropertyService,
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // Page Load
  // ==========================================

  ngOnInit(): void {

    this.loadPropertyStats();

    this.loadInquiryStats();

  }


  // ==========================================
  // Load Property Statistics
  // ==========================================

  loadPropertyStats(): void {

    this.propertyService.getMyProperties().subscribe({

      next: (data) => {

        console.log(
          'OWNER DASHBOARD PROPERTIES:',
          data
        );

        // Store properties
        this.properties = data;


        // Total Properties
        this.totalProperties = data.length;


        // Approved Properties
        this.approvedProperties = data.filter(
          property =>
            property.status?.toLowerCase() === 'approved'
        ).length;


        // Pending Properties
        this.pendingProperties = data.filter(
          property =>
            property.status?.toLowerCase() === 'pending'
        ).length;


        // Rejected Properties
        this.rejectedProperties = data.filter(
          property =>
            property.status?.toLowerCase() === 'rejected'
        ).length;


        // Console output for checking
        console.log(
          'Total:',
          this.totalProperties
        );

        console.log(
          'Approved:',
          this.approvedProperties
        );

        console.log(
          'Pending:',
          this.pendingProperties
        );

        console.log(
          'Rejected:',
          this.rejectedProperties
        );


        // Refresh Angular UI
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'OWNER DASHBOARD PROPERTY ERROR:',
          error
        );

      }

    });

  }


  // ==========================================
  // Load Inquiry Statistics
  // ==========================================

  loadInquiryStats(): void {

    this.inquiryService
      .getOwnerInquiries()
      .subscribe({

        next: (data) => {

          // Store inquiries
          this.inquiries = data;


          // Total inquiries
          this.totalInquiries = data.length;


          // Console output
          console.log(
            'OWNER INQUIRIES:',
            data
          );

          console.log(
            'TOTAL INQUIRIES:',
            this.totalInquiries
          );


          // Refresh Angular UI
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'OWNER DASHBOARD INQUIRY ERROR:',
            error
          );

        }

      });

  }

}