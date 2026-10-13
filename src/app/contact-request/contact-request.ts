import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContactRequestService,
  ContactRequest as ContactRequestModel
} from '../services/contact-request.service';

@Component({
  selector: 'app-contact-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-request.html',
  styleUrl: './contact-request.css'
})
export class ContactRequest {

  contactRequest: ContactRequestModel = {
    fullName: '',
    email: '',
    phoneNumber: '',
    interestedIn: '',
    message: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private contactRequestService: ContactRequestService,
    private cdr: ChangeDetectorRef
  ) {}

  submitRequest(): void {

    this.successMessage = '';
    this.errorMessage = '';

    // Validate required fields
    if (
      !this.contactRequest.fullName ||
      !this.contactRequest.email ||
      !this.contactRequest.phoneNumber ||
      !this.contactRequest.interestedIn
    ) {
      this.errorMessage =
        'Please fill in all required fields.';

      this.cdr.detectChanges();

      return;
    }

    // Show submitting state
    this.isSubmitting = true;

    this.contactRequestService
      .submitContactRequest(this.contactRequest)
      .subscribe({

        // SUCCESS
        next: (response) => {

          console.log(
            'Callback request submitted:',
            response
          );

          this.successMessage =
            'Thank you! Your callback request has been submitted successfully. Our PrimeHomes team will contact you soon.';

          this.errorMessage = '';

          // Clear form
          this.contactRequest = {
            fullName: '',
            email: '',
            phoneNumber: '',
            interestedIn: '',
            message: ''
          };

          // Stop submitting state
          this.isSubmitting = false;

          // Force UI refresh
          this.cdr.detectChanges();
        },

        // ERROR
        error: (error) => {

          console.error(
            'Callback request failed:',
            error
          );

          this.errorMessage =
            'Unable to submit your request. Please try again.';

          this.successMessage = '';

          // Stop submitting state
          this.isSubmitting = false;

          // Force UI refresh
          this.cdr.detectChanges();
        }

      });
  }
}