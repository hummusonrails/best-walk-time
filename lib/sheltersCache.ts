import { Shelter } from "./types";

let cache: { data: Shelter[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const OVERPASS_QUERY = `
[out:json][timeout:60];
area["ISO3166-1"="IL"]->.searchArea;
(
  node["amenity"="shelter"]["shelter_type"="bomb_shelter"](area.searchArea);
  way["amenity"="shelter"]["shelter_type"="bomb_shelter"](area.searchArea);
  node["building"="bunker"]["bunker_type"="bomb_shelter"](area.searchArea);
  way["building"="bunker"]["bunker_type"="bomb_shelter"](area.searchArea);
);
out center body;
`;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function getShelters(): Promise<Shelter[]> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API responded with ${response.status}`);
    }

    const json = await response.json();
    const elements: OverpassElement[] = json.elements || [];

    const shelters: Shelter[] = elements
      .reduce<Shelter[]>((acc, el) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;

        if (lat == null || lng == null) return acc;

        acc.push({
          id: `osm-${el.type}-${el.id}`,
          lat,
          lng,
          name: el.tags?.name || el.tags?.["name:he"] || undefined,
          address: el.tags?.["addr:street"]
            ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}`.trim()
            : undefined,
          type: el.tags?.shelter_type || el.tags?.bunker_type || "bomb_shelter",
        });
        return acc;
      }, []);

    cache = { data: shelters, timestamp: now };
    return shelters;
  } catch (error) {
    console.error("Failed to fetch shelters from Overpass:", error);

    if (cache) {
      return cache.data;
    }

    return [];
  }
}
