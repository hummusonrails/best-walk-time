export interface Alert {
  id: string;
  timestamp: number;
  cities: string[];
  threat: number;
  isDrill: boolean;
}

export interface ProcessedAlert {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  cities: string[];
  threat: number;
}

export interface SafetyStats {
  timeSinceLastAlert: number; // minutes
  averageGap: number; // minutes
  alertCount24h: number;
  trend: "increasing" | "decreasing" | "stable";
  safetyScore: number; // 0-100
  lastAlertTime: string | null;
}

export type SafetyLevel = "safe" | "risky" | "dangerous";

export interface SafetyRecommendation {
  level: SafetyLevel;
  score: number;
  message: string;
  messageHe: string;
}

export type Language = "en" | "he";

export interface Shelter {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  type?: string;
}

export interface NearestShelter extends Shelter {
  distanceM: number; // meters
  walkMinutes: number; // estimated walking time
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}
