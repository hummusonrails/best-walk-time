"use client";

import { useTranslation, type PreAlertStatus } from "best-time-ui";
import { NearestShelter } from "@/lib/types";
import { formatDistance } from "@/lib/geo";

interface Props {
  preAlertStatus: PreAlertStatus;
  nearestShelter: NearestShelter;
}

/**
 * Shown when pre-alerts are active AND the nearest shelter is > 500m away.
 * Walk-specific: combines shelter proximity data with pre-alert intelligence.
 */
export default function ShelterPreAlertWarning({ preAlertStatus, nearestShelter }: Props) {
  const { t } = useTranslation();

  // Only show when there is active warning activity and shelter is far
  if (!preAlertStatus.hasActiveWarning && preAlertStatus.warningCount2h < 1) return null;
  if (nearestShelter.distanceM <= 500) return null;

  const dist = formatDistance(nearestShelter.distanceM);

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-950/30 border border-amber-500/25">
        <span className="text-amber-400 text-base mt-0.5 shrink-0">&#9888;</span>
        <span className="font-mono text-xs text-amber-200/80 leading-relaxed">
          {t("prealert.shelterFar").replace("{dist}", dist)}
        </span>
      </div>
    </section>
  );
}
