import { type SafetyStats, type SafetyLevel, type SafetyRecommendation, type PreAlertStatus } from "best-time-ui";
import { NearestShelter } from "./types";

export function computeWalkScore(
  baseScore: number,
  nearestShelter: NearestShelter | null
): number {
  if (!nearestShelter) {
    return Math.round(baseScore * 0.9);
  }

  const d = nearestShelter.distanceM;

  if (d > 5000) {
    return Math.round(baseScore * 0.9);
  }

  let shelterScore: number;
  if (d < 200) shelterScore = 100;
  else if (d < 500) shelterScore = 100 - ((d - 200) / 300) * 25;
  else if (d < 1000) shelterScore = 75 - ((d - 500) / 500) * 35;
  else shelterScore = Math.max(10, 40 - ((d - 1000) / 4000) * 30);

  return Math.round(Math.max(0, Math.min(100, baseScore * 0.75 + shelterScore * 0.25)));
}

export function getWalkRecommendation(
  stats: SafetyStats,
  walkDuration: number,
  nearestShelter: NearestShelter | null,
  preAlertStatus?: PreAlertStatus | null
): SafetyRecommendation {
  const baseWalkScore = computeWalkScore(stats.safetyScore, nearestShelter);
  const { timeSinceLastAlert, averageGap } = stats;

  const durationPenalty = 1 - (walkDuration - 5) * 0.005;
  let durationFactor = Math.max(0.7, Math.min(1.0, durationPenalty));

  // If pre-alerts show recent warning activity, penalize longer walks more heavily
  if (preAlertStatus && preAlertStatus.warningCount2h >= 2 && walkDuration > 20) {
    durationFactor *= 1.5;
    // Re-clamp after multiplier — lower bound shifts down for longer walks under warning
    durationFactor = Math.max(0.5, Math.min(1.0, durationFactor));
  }

  const timeRatio = timeSinceLastAlert / Math.max(walkDuration, 1);
  const gapRatio = averageGap === Infinity ? 10 : averageGap / Math.max(walkDuration, 1);

  const timeBonus = Math.min(15, (timeRatio - 1) * 3);
  const gapBonus = Math.min(10, (gapRatio - 1) * 5);
  let walkScore = Math.round(
    Math.max(0, Math.min(100, baseWalkScore * durationFactor + timeBonus + gapBonus))
  );

  // Departure window bonus: recent exit with no active warning
  if (preAlertStatus?.hasRecentExit && !preAlertStatus.hasActiveWarning) {
    // If the average gap comfortably exceeds walk duration, bump score slightly
    if (averageGap !== Infinity && averageGap > walkDuration * 1.5) {
      walkScore = Math.min(100, walkScore + 5);
    }
  }

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
