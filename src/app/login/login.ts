import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
  }

  login(): void {

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

        alert('Login successful!');

       if (response.role === 'Owner') {
  window.location.href = '/owner-dashboard';
}
else if (response.role === 'Buyer') {
  window.location.href = '/buyer-dashboard';
}
else if (response.role === 'Admin') {
  window.location.href = '/admin-dashboard';
}
      },

      error: (error) => {

        console.error('Login error:', error);

        alert('Invalid email or password');

      }

    });
  }
}