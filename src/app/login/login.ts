import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
  }

  login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>(
      'https://localhost:7299/api/Auth/login',
      loginData
    ).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('role', response.role);
        localStorage.setItem('name', response.name);

        const destinations: Record<string, string> = {
          Owner: '/owner-dashboard',
          Buyer: '/buyer-dashboard',
          Admin: '/admin-dashboard'
        };
        const destination = destinations[response.role];

        this.isLoading = false;
        if (destination) {
          this.router.navigate([destination]);
        } else {
          this.errorMessage = 'Your account role could not be recognized. Please contact support.';
        }
      },

      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message
          || error.error?.title
          || (typeof error.error === 'string' ? error.error : '')
          || 'Unable to sign in. Check your email and password, then try again.';
      }

    });
  }
}