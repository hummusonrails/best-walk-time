import { Shelter, NearestShelter, UserLocation } from "./types";

const EARTH_RADIUS_M = 6_371_000;
const WALK_SPEED_KMH = 4.5; // average walking speed

/** Haversine distance in meters between two coordinates */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Estimate walking time in minutes for a given distance in meters */
export function walkingTime(distanceM: number): number {
  return (distanceM / 1000 / WALK_SPEED_KMH) * 60;
}

/** Find the nearest shelters to a given location, sorted by distance */
export function findNearestShelters(
  location: UserLocation,
  shelters: Shelter[],
  limit: number = 5
): NearestShelter[] {
  return shelters
    .map((shelter) => {
      const distanceM = haversineDistance(
        location.lat,
        location.lng,
        shelter.lat,
        shelter.lng
      );
      return {
        ...shelter,
        distanceM: Math.round(distanceM),
        walkMinutes: Math.round(walkingTime(distanceM)),
      };
    })
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

/** Format distance for display */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
