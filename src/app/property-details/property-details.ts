import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Property } from '../models/property';
import { Property as PropertyService } from '../services/property';
import { InquiryService } from '../services/inquiry';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetails implements OnInit {

  property?: Property;

  inquiryMessage = '';

  isLoggedIn = false;
  userRole = '';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole = localStorage.getItem('role') || '';

    const id = Number(this.route.snapshot.paramMap.get('id'));

    console.log('Property ID:', id);

    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        console.log('Property Details API Response:', data);

        this.property = data;

        console.log('Property Assigned:', this.property);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading property:', error);
      }
    });

  }

  sendInquiry(): void {

    if (!this.property) {
      return;
    }

    if (!this.isLoggedIn || this.userRole !== 'Buyer') {
      alert('Please login as a Buyer to send an inquiry.');
      return;
    }

    if (!this.inquiryMessage.trim()) {
      alert('Please enter a message.');
      return;
    }

    const inquiry = {
      propertyId: this.property.propertyId,
      message: this.inquiryMessage
    };

    this.inquiryService.addInquiry(inquiry).subscribe({
      next: () => {
        alert('Inquiry sent successfully!');
        this.inquiryMessage = '';
      },
      error: (error) => {
        console.error('Error sending inquiry:', error);
        alert('Unable to send inquiry.');
      }
    });

  }

}