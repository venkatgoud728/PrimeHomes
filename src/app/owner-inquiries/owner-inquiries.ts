import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Inquiry } from '../models/inquiry';
import { InquiryService } from '../services/inquiry';

@Component({
  selector: 'app-owner-inquiries',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './owner-inquiries.html',
  styleUrl: './owner-inquiries.css'
})
export class OwnerInquiries implements OnInit {

  inquiries: Inquiry[] = [];

  constructor(
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.inquiryService.getOwnerInquiries().subscribe({
      next: (data) => {
        this.inquiries = data;

        console.log('Owner Inquiries:', data);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading inquiries:', error);
      }
    });
  }

  updateStatus(inquiry: Inquiry, status: string): void {

  if (!inquiry.inquiryId) {
    return;
  }

  this.inquiryService.updateInquiryStatus(inquiry.inquiryId, status)
    .subscribe({
      next: () => {
        alert('Inquiry updated successfully.');
        this.loadInquiries();
      },
      error: (error) => {
        console.error('Error updating inquiry:', error);
      }
    });
}

}