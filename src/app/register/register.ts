import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  register(): void {

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

        if (error.error) {
          this.errorMessage = error.error;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}