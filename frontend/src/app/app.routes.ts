import { Routes } from '@angular/router';
import { ContactRequest } from './contact-request/contact-request';
import { Home } from './home/home';
import { PropertyList } from './property-list/property-list';
import { PropertyDetails } from './property-details/property-details';
import { Login } from './login/login';
import { Register } from './register/register';
import { OwnerDashboard } from './owner-dashboard/owner-dashboard';
import { MyProperties } from './my-properties/my-properties';
import { AddProperty } from './add-property/add-property';
import { OwnerInquiries } from './owner-inquiries/owner-inquiries';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { MyInquiries } from './my-inquiries/my-inquiries';
import { BuyerDashboard } from './buyer-dashboard/buyer-dashboard';
import { MyFavorites } from './my-favorites/my-favorites';
import { CompareProperties } from './compare-properties/compare-properties';
import { Notifications } from './notifications/notifications';
import { UserProfileComponent } from './user-profile/user-profile';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';


export const routes: Routes = [

  // =========================
  // HOME
  // =========================

  {
    path: '',
    component: Home
  },


  // =========================
  // LOGIN
  // =========================

  {
    path: 'login',
    component: Login
  },


  // =========================
  // REGISTER
  // =========================

  {
    path: 'register',
    component: Register
  },
  {
  path: 'notifications',
  component: Notifications,
  canActivate: [authGuard]
},
{
  path: 'contact-request',
  component: ContactRequest
},


  // =========================
  // PROPERTY LIST
  // BUYER / OWNER / ADMIN
  // =========================

  {
    path: 'properties',
    component: PropertyList,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer', 'Owner', 'Admin']
    }
  },


  // =========================
  // PROPERTY COMPARISON
  // BUYER ONLY
  // =========================

  {
    path: 'compare-properties',
    component: CompareProperties,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer']
    }
  },


  // =========================
  // PROPERTY DETAILS
  // BUYER / OWNER / ADMIN
  // =========================

  {
    path: 'properties/:id',
    component: PropertyDetails,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer', 'Owner', 'Admin']
    }
  },


  // =========================
  // BUYER DASHBOARD
  // BUYER ONLY
  // =========================

  {
    path: 'buyer-dashboard',
    component: BuyerDashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer']
    }
  },


  // =========================
  // BUYER - MY FAVORITES
  // BUYER ONLY
  // =========================

  {
    path: 'my-favorites',
    component: MyFavorites,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer']
    }
  },


  // =========================
  // USER PROFILE
  // BUYER / OWNER
  // =========================

  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard]
  },


  // =========================
  // BUYER - MY INQUIRIES
  // BUYER ONLY
  // =========================

  {
    path: 'my-inquiries',
    component: MyInquiries,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Buyer']
    }
  },


  // =========================
  // OWNER DASHBOARD
  // OWNER ONLY
  // =========================

  {
    path: 'owner-dashboard',
    component: OwnerDashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Owner']
    }
  },


  // =========================
  // OWNER - MY PROPERTIES
  // OWNER ONLY
  // =========================

  {
    path: 'my-properties',
    component: MyProperties,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Owner']
    }
  },


  // =========================
  // OWNER - ADD PROPERTY
  // OWNER ONLY
  // =========================

  {
    path: 'add-property',
    component: AddProperty,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Owner']
    }
  },


  // =========================
  // OWNER - INQUIRIES
  // OWNER ONLY
  // =========================

  {
    path: 'owner-inquiries',
    component: OwnerInquiries,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Owner']
    }
  },


  // =========================
  // ADMIN DASHBOARD
  // ADMIN ONLY
  // =========================

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['Admin']
    }
  },


  // =========================
  // INVALID URL
  // =========================

  {
    path: '**',
    redirectTo: ''
  }

];