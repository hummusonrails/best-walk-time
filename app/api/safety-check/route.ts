import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/lib/alertsCache";
import { computeStats, getWalkRecommendation } from "@/lib/safety";
import { filterAlertsByRegion } from "@/lib/regions";
import { getShelters } from "@/lib/sheltersCache";
import { findNearestShelters } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const region = searchParams.get("region") || "all";
  const city = searchParams.get("city") || null;
  const duration = Number(searchParams.get("duration")) || 15;
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;

  const alerts = await getAlerts();

  const filtered = city
    ? alerts.filter((a) => a.cities.some((c) => c.includes(city)))
    : alerts.filter((a) => filterAlertsByRegion(a.cities, region));

  const stats = computeStats(filtered);

  let nearestShelter = null;
  if (lat != null && lng != null) {
    const shelters = await getShelters();
    const nearest = findNearestShelters({ lat, lng }, shelters, 1);
    nearestShelter = nearest[0] || null;
  }

  const rec = getWalkRecommendation(stats, duration, nearestShelter);

  return NextResponse.json({
    level: rec.level,
    score: rec.score,
    message: rec.message,
    messageHe: rec.messageHe,
  });
}
