import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  user = {
    fullName: '',
    email: '',
    password: '',
    role: 'Buyer'
  };

  message = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  register(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    const registerData = {
      name: this.user.fullName,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {

        console.log('Registration successful:', response);

        this.isLoading = false;
        this.message = 'Registration successful! Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {

        console.error('Registration failed:', error);

        this.isLoading = false;

        this.errorMessage = error.error?.message
          || error.error?.title
          || (typeof error.error === 'string' ? error.error : '')
          || 'Registration failed. Please check your details and try again.';
      }
    });
  }
}