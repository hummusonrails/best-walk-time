import { ProcessedAlert, SafetyStats, SafetyLevel, SafetyRecommendation, NearestShelter } from "./types";

export function computeStats(alerts: ProcessedAlert[]): SafetyStats {
  const now = Date.now();

  if (alerts.length === 0) {
    return {
      timeSinceLastAlert: Infinity,
      averageGap: Infinity,
      alertCount24h: 0,
      trend: "stable",
      safetyScore: 95,
      lastAlertTime: null,
    };
  }

  const sorted = [...alerts].sort((a, b) => b.timestamp - a.timestamp);

  const timeSinceLastAlert = (now - sorted[0].timestamp) / (1000 * 60);

  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
  const recent24h = sorted.filter((a) => a.timestamp > twentyFourHoursAgo);
  const alertCount24h = recent24h.length;

  const sixHoursAgo = now - 6 * 60 * 60 * 1000;
  const recent6h = sorted.filter((a) => a.timestamp > sixHoursAgo);
  let averageGap = Infinity;
  if (recent6h.length > 1) {
    const gaps: number[] = [];
    for (let i = 0; i < recent6h.length - 1; i++) {
      gaps.push((recent6h[i].timestamp - recent6h[i + 1].timestamp) / (1000 * 60));
    }
    averageGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  }

  let trend: "increasing" | "decreasing" | "stable" = "stable";
  if (recent24h.length >= 4) {
    const mid = Math.floor(recent24h.length / 2);
    const recentHalf = recent24h.slice(0, mid);
    const olderHalf = recent24h.slice(mid);

    const recentSpan = recentHalf.length > 1
      ? (recentHalf[0].timestamp - recentHalf[recentHalf.length - 1].timestamp) / (1000 * 60 * 60)
      : 1;
    const olderSpan = olderHalf.length > 1
      ? (olderHalf[0].timestamp - olderHalf[olderHalf.length - 1].timestamp) / (1000 * 60 * 60)
      : 1;

    const recentRate = recentHalf.length / Math.max(recentSpan, 0.5);
    const olderRate = olderHalf.length / Math.max(olderSpan, 0.5);

    if (recentRate > olderRate * 1.3) trend = "increasing";
    else if (recentRate < olderRate * 0.7) trend = "decreasing";
  }

  const safetyScore = calculateSafetyScore(
    timeSinceLastAlert,
    averageGap,
    trend,
    alertCount24h
  );

  const lastDate = new Date(sorted[0].timestamp);
  const lastAlertTime = lastDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    timeSinceLastAlert,
    averageGap,
    alertCount24h,
    trend,
    safetyScore,
    lastAlertTime,
  };
}

function calculateSafetyScore(
  timeSinceLastAlert: number,
  averageGap: number,
  trend: "increasing" | "decreasing" | "stable",
  alertCount24h: number
): number {
  const timeScore = Math.min(100, (timeSinceLastAlert / 60) * 100);
  const gapScore = averageGap === Infinity ? 100 : Math.min(100, (averageGap / 60) * 100);
  const trendScore = trend === "decreasing" ? 80 : trend === "stable" ? 50 : 20;
  const freqScore = Math.max(0, 100 - alertCount24h * 5);

  const weighted =
    timeScore * 0.4 + gapScore * 0.25 + trendScore * 0.2 + freqScore * 0.15;

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

/**
 * Walk-specific safety scoring that factors in shelter proximity.
 * Blends the base alert score with shelter accessibility.
 */
export function computeWalkScore(
  baseScore: number,
  nearestShelter: NearestShelter | null
): number {
  if (!nearestShelter) {
    // No shelter data at all — use alert score only with small penalty
    return Math.round(baseScore * 0.9);
  }

  const d = nearestShelter.distanceM;

  // If the nearest shelter is very far (>5km), shelter data is effectively
  // unavailable for this location — fall back to alert-only scoring
  if (d > 5000) {
    return Math.round(baseScore * 0.9);
  }

  // Shelter proximity score (0-100)
  // < 200m (< 2.5 min walk): 100
  // 200-500m: 75
  // 500-1000m: 40
  // 1000-5000m: scales 40→10
  let shelterScore: number;
  if (d < 200) shelterScore = 100;
  else if (d < 500) shelterScore = 100 - ((d - 200) / 300) * 25; // 100→75
  else if (d < 1000) shelterScore = 75 - ((d - 500) / 500) * 35; // 75→40
  else shelterScore = Math.max(10, 40 - ((d - 1000) / 4000) * 30); // 40→10

  // Weighted blend: 75% alert-based, 25% shelter proximity
  return Math.round(Math.max(0, Math.min(100, baseScore * 0.75 + shelterScore * 0.25)));
}

export function getWalkRecommendation(
  stats: SafetyStats,
  walkDuration: number,
  nearestShelter: NearestShelter | null
): SafetyRecommendation {
  const baseWalkScore = computeWalkScore(stats.safetyScore, nearestShelter);
  const { timeSinceLastAlert, averageGap } = stats;

  // Duration scaling: longer walks = more exposure = lower effective score
  // 5 min walk: 1.0x (no penalty), 30 min: ~0.85x, 60 min: ~0.7x
  const durationPenalty = 1 - (walkDuration - 5) * 0.005; // 5min=1.0, 60min=0.725
  const durationFactor = Math.max(0.7, Math.min(1.0, durationPenalty));

  // Time-safety ratio: how many times your walk fits in the gap since last alert
  // Higher = safer. A 5min walk with 2h gap = 24x. A 60min walk = 2x.
  const timeRatio = timeSinceLastAlert / Math.max(walkDuration, 1);

  // Also factor in average gap — if avg gap between alerts is shorter than your
  // walk, that's risky even if the last alert was a while ago
  const gapRatio = averageGap === Infinity ? 10 : averageGap / Math.max(walkDuration, 1);

  // Combine: base score adjusted by duration, time ratio, and gap ratio
  const timeBonus = Math.min(15, (timeRatio - 1) * 3); // up to +15 for large gaps
  const gapBonus = Math.min(10, (gapRatio - 1) * 5);   // up to +10 for large avg gaps
  const walkScore = Math.round(
    Math.max(0, Math.min(100, baseWalkScore * durationFactor + timeBonus + gapBonus))
  );

  const hasShelterData = nearestShelter && nearestShelter.distanceM < 5000;
  const shelterNearby = nearestShelter && nearestShelter.distanceM < 500;
  const shelterReachable = nearestShelter && nearestShelter.distanceM < 1000;

  let level: SafetyLevel;

  if (walkScore < 40 || timeSinceLastAlert < walkDuration) {
    level = "dangerous";
  } else if (
    walkScore > 70 &&
    timeRatio > 4 &&
    (!hasShelterData || shelterNearby)
  ) {
    level = "safe";
  } else if (
    walkScore > 55 &&
    timeRatio > 2 &&
    (!hasShelterData || shelterReachable)
  ) {
    level = "risky";
  } else if (walkScore < 55) {
    level = "dangerous";
  } else {
    level = "risky";
  }

  const messages: Record<SafetyLevel, { en: string; he: string }> = {
    safe: {
      en: "GOOD TIME FOR A WALK",
      he: "זמן טוב לטייל",
    },
    risky: {
      en: "RISKY TIME TO WALK",
      he: "זמן מסוכן לטייל",
    },
    dangerous: {
      en: "NOT SAFE TO WALK",
      he: "לא בטוח לטייל",
    },
  };

  return {
    level,
    score: walkScore,
    message: messages[level].en,
    messageHe: messages[level].he,
  };
}

export function getRecommendation(
  stats: SafetyStats,
  activityDuration: number
): SafetyRecommendation {
  return getWalkRecommendation(stats, activityDuration, null);
}

export function formatDuration(minutes: number): string {
  if (minutes === Infinity) return "N/A";
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
