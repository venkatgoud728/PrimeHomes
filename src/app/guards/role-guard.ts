import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const router = inject(Router);

  // Get the login token
  const token = localStorage.getItem('token');

  // If token does not exist, go to Login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {

    // Read the middle part of JWT token
    const payload = token.split('.')[1];

    // Decode JWT payload
    const decodedPayload = JSON.parse(atob(payload));

    // Get user's role
    const userRole =
      decodedPayload.role ||
      decodedPayload.Role ||
      decodedPayload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    // Get allowed roles from route
    const allowedRoles = route.data['roles'] as string[];

    // Check whether the user's role is allowed
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Unauthorized role
    alert('You are not authorized to access this page.');

    router.navigate(['/']);

    return false;

  } catch (error) {

    console.error('Invalid token:', error);

    localStorage.removeItem('token');

    router.navigate(['/login']);

    return false;
  }
};