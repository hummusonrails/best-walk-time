import { Shelter } from "./types";

let cache: { data: Shelter[]; timestamp: number } | null = null;
// Shelter locations are essentially static — they don't move.
// Future improvement: pre-generate this as static JSON at build time
// to avoid runtime fetches entirely.
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Coverage bounds for each municipal data source
export const COVERAGE_AREAS = [
  { id: "tel-aviv", nameEn: "Tel Aviv", nameHe: "תל אביב", bounds: { lat: [32.03, 32.15] as [number, number], lng: [34.74, 34.82] as [number, number] } },
  { id: "haifa", nameEn: "Haifa", nameHe: "חיפה", bounds: { lat: [32.75, 32.84] as [number, number], lng: [34.95, 35.08] as [number, number] } },
  { id: "jerusalem", nameEn: "Jerusalem", nameHe: "ירושלים", bounds: { lat: [31.73, 31.83] as [number, number], lng: [35.17, 35.25] as [number, number] } },
  { id: "beer-sheva", nameEn: "Beer Sheva", nameHe: "באר שבע", bounds: { lat: [31.2, 31.3] as [number, number], lng: [34.75, 34.85] as [number, number] } },
];

export function isInCoverageArea(lat: number, lng: number): { covered: boolean; area?: string } {
  for (const area of COVERAGE_AREAS) {
    const [latMin, latMax] = area.bounds.lat;
    const [lngMin, lngMax] = area.bounds.lng;
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return { covered: true, area: area.nameEn };
    }
  }
  return { covered: false };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoFeature = { geometry?: { coordinates?: number[]; x?: number; y?: number }; attributes?: Record<string, any>; properties?: Record<string, any> };

// --- Tel Aviv: ArcGIS REST (paginated) ---
async function fetchTelAviv(): Promise<Shelter[]> {
  const baseUrl = "https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/592/query";
  const shelters: Shelter[] = [];
  let offset = 0;
  const pageSize = 200;

  try {
    while (true) {
      const params = new URLSearchParams({
        where: "1=1",
        outFields: "*",
        f: "json",
        resultRecordCount: String(pageSize),
        resultOffset: String(offset),
      });

      const res = await fetch(`${baseUrl}?${params}`, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) break;

      const json = await res.json();
      const features = json.features || [];
      if (features.length === 0) break;

      for (const f of features) {
        const geom = f.geometry;
        const attrs = f.attributes || {};
        if (!geom?.y || !geom?.x) continue;

        shelters.push({
          id: `tlv-${attrs.OBJECTID || offset}`,
          lat: geom.y,
          lng: geom.x,
          name: attrs.shem_miklat || attrs.NAME || undefined,
          address: attrs.ktovet || attrs.ADDRESS || undefined,
          type: "bomb_shelter",
        });
      }

      if (features.length < pageSize) break;
      offset += pageSize;
    }
    console.log(`[shelters] Tel Aviv: ${shelters.length} shelters`);
  } catch (e) {
    console.error("[shelters] Tel Aviv fetch failed:", e);
  }

  return shelters;
}

// --- Haifa: GeoJSON ---
async function fetchHaifa(): Promise<Shelter[]> {
  const url = "https://opendata.haifa.muni.il/dataset/5d0cd14d-c738-488f-84fa-310270ef5d0b/resource/cdd1571a-c55f-4d5d-aef1-0135a68d8d9e/download/gis.geojson";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const features: GeoFeature[] = json.features || [];
    const shelters: Shelter[] = [];

    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const props = f.properties || {};
      shelters.push({
        id: `haifa-${props.OBJECTID || shelters.length}`,
        lat: coords[1],
        lng: coords[0],
        name: props.shem || props.NAME || undefined,
        address: props.ktovet || props.ADDRESS || undefined,
        type: "bomb_shelter",
      });
    }

    console.log(`[shelters] Haifa: ${shelters.length} shelters`);
    return shelters;
  } catch (e) {
    console.error("[shelters] Haifa fetch failed:", e);
    return [];
  }
}

// --- Jerusalem: GeoJSON ---
async function fetchJerusalem(): Promise<Shelter[]> {
  const url = "https://jerusalem.datacity.org.il/dataset/3e97d0fc-4268-4aea-844d-12588f55d809/resource/b9bd9575-d431-4f9d-af4b-1413d3c13590/download/data.geojson";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const features: GeoFeature[] = json.features || [];
    const shelters: Shelter[] = [];

    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const props = f.properties || {};
      shelters.push({
        id: `jlm-${props.OBJECTID || shelters.length}`,
        lat: coords[1],
        lng: coords[0],
        name: props.shelter_number ? `Shelter #${props.shelter_number}` : undefined,
        type: "bomb_shelter",
      });
    }

    console.log(`[shelters] Jerusalem: ${shelters.length} shelters`);
    return shelters;
  } catch (e) {
    console.error("[shelters] Jerusalem fetch failed:", e);
    return [];
  }
}

// --- Beer Sheva: GeoJSON from data.gov.il ---
async function fetchBeerSheva(): Promise<Shelter[]> {
  const url = "https://data.gov.il/dataset/023b7883-3599-4cb7-adef-1a76ea051cf0/resource/6c26c438-9283-471d-8f81-43833b6bbcb6/download/shelters.geojson";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const features: GeoFeature[] = json.features || [];
    const shelters: Shelter[] = [];

    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const props = f.properties || {};
      shelters.push({
        id: `bs-${props.name || shelters.length}`,
        lat: coords[1],
        lng: coords[0],
        name: props.name || undefined,
        type: "bomb_shelter",
      });
    }

    console.log(`[shelters] Beer Sheva: ${shelters.length} shelters`);
    return shelters;
  } catch (e) {
    console.error("[shelters] Beer Sheva fetch failed:", e);
    return [];
  }
}

// --- OSM Overpass: fallback for everywhere else ---
interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function fetchOSM(): Promise<Shelter[]> {
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

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);

    const json = await res.json();
    const elements: OverpassElement[] = json.elements || [];

    const shelters = elements.reduce<Shelter[]>((acc, el) => {
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

    console.log(`[shelters] OSM: ${shelters.length} shelters`);
    return shelters;
  } catch (e) {
    console.error("[shelters] OSM fetch failed:", e);
    return [];
  }
}

// --- Deduplicate shelters within ~50m of each other ---
function deduplicateShelters(shelters: Shelter[]): Shelter[] {
  const THRESHOLD = 0.0005; // ~50m in lat/lng degrees
  const result: Shelter[] = [];

  for (const s of shelters) {
    const isDuplicate = result.some(
      (existing) =>
        Math.abs(existing.lat - s.lat) < THRESHOLD &&
        Math.abs(existing.lng - s.lng) < THRESHOLD
    );
    if (!isDuplicate) {
      result.push(s);
    }
  }

  return result;
}

// --- Main aggregator ---
export async function getShelters(): Promise<Shelter[]> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Fetch all sources in parallel
  const [telAviv, haifa, jerusalem, beerSheva, osm] = await Promise.all([
    fetchTelAviv(),
    fetchHaifa(),
    fetchJerusalem(),
    fetchBeerSheva(),
    fetchOSM(),
  ]);

  const all = [...telAviv, ...haifa, ...jerusalem, ...beerSheva, ...osm];
  const deduplicated = deduplicateShelters(all);

  console.log(`[shelters] Total: ${deduplicated.length} (before dedup: ${all.length})`);

  cache = { data: deduplicated, timestamp: now };
  return deduplicated;
}
