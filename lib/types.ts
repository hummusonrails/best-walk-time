export interface Shelter {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  type?: string;
}

export interface NearestShelter extends Shelter {
  distanceM: number;
  walkMinutes: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
