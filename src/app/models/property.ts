export interface Property {
  propertyId: number;
  title: string;
  description: string;
  propertyType: string;
  bhk: number;
  price: number;
  area: number;
  location: string;
  city: string;
  imageUrl?: string;
  ownerId: number;
  status: string;
  createdDate: string;
}