export interface Property {
  id: number;
  external_id: string;
  address: string;
  city: string;
  postal_code: string;
  property_type: string;
  rooms: number | null;
  area: number;
  latitude: number | null;
  longitude: number | null;
  price_history: {
    price: number;
    transaction_date: string;
  }[];
}

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  propertyTypes?: string[];
  minRooms?: number;
  maxRooms?: number;
  startDate?: string;
  endDate?: string;
}
