export interface Inquiry {
  inquiryId?: number;
  propertyId: number;
  propertyTitle?: string;
  buyerId?: number;
  ownerId?: number;
  message: string;
  status?: string;
  createdDate?: string;
}