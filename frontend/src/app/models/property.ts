
export interface Property {
  propertyId: number;
  id?: number;

  title: string;
  description: string;
  propertyType: string;

  bhk?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;

  price: number;
  area: number;
  location: string;
  city: string;

  // Lifestyle and community facilities saved as a JSON string
  lifestyleFeatures?: string;

  // Property map coordinates
  latitude?: number | null;
  longitude?: number | null;

  // Main property image
  imageUrl?: string;

  ownerId: number;
  status: string;
  badge?: string;
  createdDate: string;

  // Multiple property images
  images?: PropertyImage[];
}

export interface PropertyImage {
  propertyImageId: number;
  propertyId: number;
  imageUrl: string;
  createdDate: string;
}
