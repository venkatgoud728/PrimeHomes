import { Routes } from '@angular/router';

import { Home } from './home/home';
import { PropertyList } from './property-list/property-list';
import { PropertyDetails } from './property-details/property-details';
import { Login } from './login/login';
import { OwnerDashboard } from './owner-dashboard/owner-dashboard';
import { MyProperties } from './my-properties/my-properties';
import { AddProperty } from './add-property/add-property';
import { OwnerInquiries } from './owner-inquiries/owner-inquiries';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Register } from './register/register';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { MyInquiries } from './my-inquiries/my-inquiries';


export const routes: Routes = [

  // =========================
  // PUBLIC PAGES
  // =========================

  {
    path: '',
    component: Home
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },


  // =========================
  // BUYER PAGES
  // =========================

  {
    path: 'properties',
    component: PropertyList,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Buyer', 'Owner', 'Admin'] }
  },

  {
    path: 'properties/:id',
    component: PropertyDetails,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Buyer', 'Owner', 'Admin'] }
  },
  {
  path: 'my-inquiries',
  component: MyInquiries,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Buyer'] }
},


  // =========================
  // OWNER PAGES
  // =========================

  {
    path: 'owner-dashboard',
    component: OwnerDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Owner'] }
  },

  {
    path: 'my-properties',
    component: MyProperties,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Owner'] }
  },

  {
    path: 'add-property',
    component: AddProperty,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Owner'] }
  },

  {
    path: 'owner-inquiries',
    component: OwnerInquiries,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Owner'] }
  },


  // =========================
  // ADMIN PAGE
  // =========================

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },


  // =========================
  // UNKNOWN URL
  // =========================

  {
    path: '**',
    redirectTo: ''
  }

];