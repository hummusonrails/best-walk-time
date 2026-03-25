import { NextResponse } from "next/server";
import { type PreAlert } from "best-time-ui";
import { createServerClient } from "@/lib/db";

export const dynamic = "force-dynamic";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function GET() {
  try {
    const db = createServerClient();
    const since = Date.now() - SIX_HOURS_MS;

    const result = await db.execute({
      sql: "SELECT id, timestamp, title_he, body_he, city_ids, regions, alert_type, created_at FROM pre_alerts WHERE timestamp > ? ORDER BY timestamp DESC",
      args: [since],
    });

    const preAlerts: PreAlert[] = result.rows.map((r) => ({
      id: r.id as string,
      timestamp: r.timestamp as number,
      title_he: r.title_he as string,
      body_he: r.body_he as string,
      city_ids: JSON.parse((r.city_ids as string) || "[]"),
      regions: JSON.parse((r.regions as string) || "[]"),
      alert_type: r.alert_type as PreAlert["alert_type"],
      created_at: r.created_at as number,
    }));

    return NextResponse.json(preAlerts, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    // Table may not exist yet — return empty array
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }
}
