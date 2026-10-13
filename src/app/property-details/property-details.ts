import * as L from 'leaflet';

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Property,
  PropertyImage
} from '../models/property';

import { Property as PropertyService } from '../services/property';
import { InquiryService } from '../services/inquiry';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.html',
  styleUrl: './property-details.css'
})
export class PropertyDetails implements OnInit, OnDestroy {

  property?: Property;

  private propertyMap?: L.Map;
  private propertyMarker?: L.Marker;
  private routeLayer?: L.Polyline;
  private startMarker?: L.CircleMarker;

  galleryImages: PropertyImage[] = [];
  selectedImageUrl: string | null = null;

  inquiryMessage = '';

  isLoggedIn = false;
  userRole = '';

  routeStartLocation = '';
  isRouteLoading = false;
  private routeStartLatitude?: number;
private routeStartLongitude?: number;
  routeMessage = '';
  routeDistance = '';
  routeDuration = '';

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private inquiryService: InquiryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole = localStorage.getItem('role') || '';

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      console.error('Invalid property ID.');
      return;
    }

    this.propertyService.getPropertyById(id).subscribe({
      next: (data: Property) => {
        this.property = data;
        this.selectedImageUrl = data.imageUrl || null;
        this.cdr.detectChanges();

        if (this.hasValidCoordinates()) {
          setTimeout(() => this.initializePropertyMap(), 300);
        }
      },
      error: (error) => {
        console.error('Error loading property:', error);
      }
    });

    this.loadGalleryImages(id);
  }

  ngOnDestroy(): void {
    if (this.routeLayer && this.propertyMap) {
      this.propertyMap.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }

    if (this.startMarker && this.propertyMap) {
      this.propertyMap.removeLayer(this.startMarker);
      this.startMarker = undefined;
    }

    if (this.propertyMap) {
      this.propertyMap.remove();
      this.propertyMap = undefined;
    }
  }

  private hasValidCoordinates(): boolean {
    if (!this.property) {
      return false;
    }

    const latitude = this.property.latitude;
    const longitude = this.property.longitude;

    return (
      latitude != null &&
      longitude != null &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  isPropertyOwner(): boolean {
    if (!this.property) {
      return false;
    }

    const loggedInUserId = Number(localStorage.getItem('userId'));

    return loggedInUserId > 0 && loggedInUserId === this.property.ownerId;
  }

  loadGalleryImages(propertyId: number): void {
    this.propertyService
      .getPropertyImages(propertyId)
      .subscribe({
        next: (images: PropertyImage[]) => {
          this.galleryImages = images || [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading gallery images:', error);
        }
      });
  }

  selectGalleryImage(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
  }

  deleteGalleryImage(image: PropertyImage): void {
    if (!this.isPropertyOwner()) {
      alert('Only the property owner can delete gallery images.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this image?');

    if (!confirmed) {
      return;
    }

    this.propertyService.deletePropertyImage(image.propertyImageId).subscribe({
      next: () => {
        alert('Gallery image deleted successfully.');

        this.galleryImages = this.galleryImages.filter(
          x => x.propertyImageId !== image.propertyImageId
        );

        if (this.selectedImageUrl === image.imageUrl) {
          this.selectedImageUrl = this.property?.imageUrl || null;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting gallery image:', error);
        alert('Unable to delete gallery image.');
      }
    });
  }

  sendInquiry(): void {
    if (!this.property) {
      return;
    }

    if (!this.isLoggedIn || this.userRole !== 'Buyer') {
      alert('Please login as a Buyer to send an inquiry.');
      return;
    }

    if (!this.inquiryMessage.trim()) {
      alert('Please enter a message.');
      return;
    }

    const inquiry = {
      propertyId: this.property.propertyId,
      message: this.inquiryMessage.trim()
    };

    this.inquiryService.addInquiry(inquiry).subscribe({
      next: () => {
        alert('Inquiry sent successfully!');
        this.inquiryMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error sending inquiry:', error);
        alert('Unable to send inquiry.');
      }
    });
  }
async showRouteToProperty(): Promise<void> {
  if (!this.property || !this.hasValidCoordinates()) {
    this.routeMessage = 'The property location is not available.';
    return;
  }

  const startLocation = this.routeStartLocation.trim();

  if (!startLocation) {
    this.routeMessage = 'Please enter your starting location.';
    return;
  }

  this.isRouteLoading = true;
  this.routeMessage = 'Searching for your starting location...';
  this.routeDistance = '';
  this.routeDuration = '';

  this.cdr.detectChanges();

  try {
    // STEP 1: Find the starting location
    const geocodingUrl =
      'https://nominatim.openstreetmap.org/search' +
      '?format=jsonv2&limit=1&q=' +
      encodeURIComponent(startLocation);

    const geocodingResponse = await fetch(geocodingUrl);

    if (!geocodingResponse.ok) {
      throw new Error('Unable to search for the starting location.');
    }

    const locations = await geocodingResponse.json();

    if (!Array.isArray(locations) || locations.length === 0) {
      this.routeMessage =
        'Starting location not found. Try a more specific address or landmark.';
      return;
    }

    const startLatitude = Number(locations[0].lat);
    const startLongitude = Number(locations[0].lon);
    
    this.routeStartLatitude = startLatitude;
    this.routeStartLongitude = startLongitude;

    if (
      !Number.isFinite(startLatitude) ||
      !Number.isFinite(startLongitude) ||
      startLatitude < -90 ||
      startLatitude > 90 ||
      startLongitude < -180 ||
      startLongitude > 180
    ) {
      this.routeMessage = 'The starting location has invalid coordinates.';
      return;
    }

    // STEP 2: Get the property destination
    const destinationLatitude = this.property.latitude!;
    const destinationLongitude = this.property.longitude!;

    this.routeMessage = 'Calculating the driving route...';
    this.cdr.detectChanges();

    // STEP 3: Request a driving route from OSRM
    const routingUrl =
      'https://router.project-osrm.org/route/v1/driving/' +
      `${startLongitude},${startLatitude};` +
      `${destinationLongitude},${destinationLatitude}` +
      '?overview=full&geometries=geojson';

    const routingResponse = await fetch(routingUrl);

    if (!routingResponse.ok) {
      throw new Error('Unable to calculate the route.');
    }

    const routingData = await routingResponse.json();

    // IMPORTANT: OSRM returns route geometry under geometry.coordinates
    const route = routingData?.routes?.[0];
    const coordinates = route?.geometry?.coordinates;

    if (
      routingData?.code !== 'Ok' ||
      !route ||
      !Array.isArray(coordinates) ||
      coordinates.length === 0
    ) {
      this.routeMessage =
        'No driving route could be calculated for this trip.';
      return;
    }

    // Convert [longitude, latitude] to Leaflet [latitude, longitude]
    const routeCoordinates: [number, number][] = coordinates.map(
      (coordinate: number[]) => [
        Number(coordinate[1]),
        Number(coordinate[0])
      ]
    );

    // STEP 4: Display distance and estimated driving time
    const distanceKm = route.distance / 1000;
    const durationMinutes = Math.round(route.duration / 60);

    this.routeDistance =
      distanceKm < 10
        ? `${distanceKm.toFixed(1)} km`
        : `${distanceKm.toFixed(1)} km`;

    this.routeDuration =
      durationMinutes >= 60
        ? `${Math.floor(durationMinutes / 60)} hr ${durationMinutes % 60} min`
        : `${durationMinutes} min`;

    // STEP 5: Make sure the map exists
    if (!this.propertyMap) {
      this.initializePropertyMap();
    }

    if (!this.propertyMap) {
      throw new Error('Property map could not be initialized.');
    }

    // Remove the previous route
    if (this.routeLayer) {
      this.propertyMap.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }

    // Remove the previous starting marker
    if (this.startMarker) {
      this.propertyMap.removeLayer(this.startMarker);
      this.startMarker = undefined;
    }

    // STEP 6: Draw the driving route
    this.routeLayer = L.polyline(routeCoordinates, {
      color: '#0d6efd',
      weight: 5,
      opacity: 0.85
    }).addTo(this.propertyMap);

    // Mark the starting location
    this.startMarker = L.circleMarker(
      [startLatitude, startLongitude],
      {
        radius: 8,
        color: '#198754',
        fillColor: '#198754',
        fillOpacity: 1
      }
    ).addTo(this.propertyMap);

    this.startMarker.bindPopup(`Start: ${startLocation}`);

    // Keep the property marker visible
    if (this.propertyMarker) {
      this.propertyMarker.bindPopup(
        this.property.title || 'Property Location'
      );
    }

    // Fit the map around the complete route
    this.propertyMap.fitBounds(
      this.routeLayer.getBounds(),
      { padding: [24, 24] }
    );

    this.routeMessage = 'Driving route calculated successfully.';

  } catch (error) {
    console.error('Route calculation error:', error);

    this.routeMessage =
      'Unable to calculate the route. Please try again.';
  } finally {
    this.isRouteLoading = false;
    this.cdr.detectChanges();
  }
}

private initializePropertyMap(): void {
  if (!this.property || !this.hasValidCoordinates()) {
    return;
  }

  const latitude = this.property.latitude!;
  const longitude = this.property.longitude!;
  const title = this.property.title || 'Property Location';

  const mapElement = document.getElementById('property-map');

  if (!mapElement) {
    console.error('Property map container was not found.');
    return;
  }

  if (this.propertyMap) {
    this.propertyMap.remove();
    this.propertyMap = undefined;
  }

  this.propertyMap = L.map(mapElement).setView(
    [latitude, longitude],
    15
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(this.propertyMap);

  this.propertyMarker = L.marker([latitude, longitude])
    .addTo(this.propertyMap)
    .bindPopup(title);

  this.propertyMarker.openPopup();

  setTimeout(() => {
    this.propertyMap?.invalidateSize();
  }, 200);
}

getOpenStreetMapDirectionsUrl(): string {
  if (!this.property || !this.hasValidCoordinates()) {
    return 'https://www.openstreetmap.org/';
  }

  const destinationLatitude = this.property.latitude!;
  const destinationLongitude = this.property.longitude!;

  if (
    this.routeStartLatitude != null &&
    this.routeStartLongitude != null
  ) {
    return (
      'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=' +
      `${this.routeStartLatitude},${this.routeStartLongitude};` +
      `${destinationLatitude},${destinationLongitude}`
    );
  }

  return (
    'https://www.openstreetmap.org/?mlat=' +
    destinationLatitude +
    '&mlon=' +
    destinationLongitude +
    '#map=16/' +
    destinationLatitude +
    '/' +
    destinationLongitude
  );
}



getGoogleMapsDirectionsUrl(): string {
  if (!this.property || !this.hasValidCoordinates()) {
    return 'https://maps.google.com/';
  }

  const destination =
    `${this.property.latitude},${this.property.longitude}`;

  const startLocation = this.routeStartLocation.trim();

  if (
    this.routeStartLatitude != null &&
    this.routeStartLongitude != null
  ) {
    const origin =
      `${this.routeStartLatitude},${this.routeStartLongitude}`;

    return (
      'https://www.google.com/maps/dir/?api=1' +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      '&travelmode=driving'
    );
  }

  if (startLocation) {
    return (
      'https://www.google.com/maps/dir/?api=1' +
      `&origin=${encodeURIComponent(startLocation)}` +
      `&destination=${encodeURIComponent(destination)}` +
      '&travelmode=driving'
    );
  }

  return (
    'https://www.google.com/maps/dir/?api=1' +
    `&destination=${encodeURIComponent(destination)}` +
    '&travelmode=driving'
  );
}


getNearbySearchUrl(category: string): string {
  const location = this.property?.location?.trim() || '';
  const title = this.property?.title?.trim() || '';

  const query = `${category} near ${title} ${location}`.trim();

  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(query)
  );
}

}
