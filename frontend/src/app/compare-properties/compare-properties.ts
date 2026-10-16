import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Property } from '../models/property';
import { CompareService } from '../services/compare.service';

@Component({
  selector: 'app-compare-properties',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './compare-properties.html',
  styleUrl: './compare-properties.css'
})
export class CompareProperties implements OnInit {

  compareProperties: Property[] = [];

  constructor(
    private compareService: CompareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompareProperties();
  }

  loadCompareProperties(): void {

    this.compareProperties =
      this.compareService.getCompareProperties();

    this.cdr.detectChanges();
  }

  removeFromCompare(propertyId: number): void {

    this.compareService.removeFromCompare(propertyId);

    this.loadCompareProperties();
  }

  clearComparison(): void {

    const confirmed = confirm(
      'Are you sure you want to clear all comparison properties?'
    );

    if (!confirmed) {
      return;
    }

    this.compareService.clearCompare();

    this.loadCompareProperties();
  }
}