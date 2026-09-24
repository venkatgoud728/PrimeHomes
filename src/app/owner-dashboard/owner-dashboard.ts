import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-owner-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css'
})
export class OwnerDashboard {

  ownerName: string = localStorage.getItem('name') || 'Owner';

}