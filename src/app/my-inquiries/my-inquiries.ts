import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { InquiryService } from '../services/inquiry';
import { Inquiry } from '../models/inquiry';

@Component({
  selector: 'app-my-inquiries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-inquiries.html',
  styleUrl: './my-inquiries.css'
})
export class MyInquiries implements OnInit {

  inquiries: Inquiry[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyInquiries();
  }

  loadMyInquiries(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.inquiryService.getMyInquiries().subscribe({

      next: (data) => {

        console.log('My Inquiries:', data);

        this.inquiries = data;
        this.isLoading = false;

        // Force Angular to update the page
        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error('Failed to load inquiries:', error);

        this.isLoading = false;
        this.errorMessage = 'Unable to load inquiries. Please try again.';

        this.cdr.detectChanges();

      }

    });
  }

}