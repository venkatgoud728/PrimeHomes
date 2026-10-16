import { Injectable } from '@angular/core';
import { Property } from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  private readonly storageKey = 'primeHomesCompare';

  private properties: Property[] = [];

  constructor() {
    this.loadFromStorage();
  }

  getCompareProperties(): Property[] {
    return this.properties;
  }

  isInCompare(propertyId: number): boolean {
    return this.properties.some(
      property => property.propertyId === propertyId
    );
  }

  addToCompare(property: Property): boolean {

    // Already added
    if (this.isInCompare(property.propertyId)) {
      return true;
    }

    // Maximum 3 properties
    if (this.properties.length >= 3) {
      return false;
    }

    this.properties.push(property);

    this.saveToStorage();

    return true;
  }

  removeFromCompare(propertyId: number): void {

    this.properties = this.properties.filter(
      property => property.propertyId !== propertyId
    );

    this.saveToStorage();
  }

  clearCompare(): void {

    this.properties = [];

    this.saveToStorage();
  }

  private saveToStorage(): void {

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.properties)
    );
  }

  private loadFromStorage(): void {

    const savedProperties =
      localStorage.getItem(this.storageKey);

    if (!savedProperties) {
      this.properties = [];
      return;
    }

    try {

      this.properties = JSON.parse(savedProperties);

    } catch (error) {

      console.error(
        'Error loading compare properties:',
        error
      );

      this.properties = [];
    }
  }
}