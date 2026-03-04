import { NextRequest, NextResponse } from "next/server";
import { getShelters } from "@/lib/sheltersCache";
import { findNearestShelters } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const limit = Number(searchParams.get("limit")) || 5;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required" },
      { status: 400 }
    );
  }

  const shelters = await getShelters();
  const nearest = findNearestShelters({ lat, lng }, shelters, limit);

  return NextResponse.json({
    total: shelters.length,
    nearest,
  });
}
