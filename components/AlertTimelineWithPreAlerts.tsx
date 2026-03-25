"use client";

import { AlertTimeline, useTranslation, type ProcessedAlert, type PreAlert } from "best-time-ui";

interface Props {
  alerts: ProcessedAlert[];
  preAlerts: PreAlert[];
}

/**
 * Wraps the shared AlertTimeline component with pre-alert hour markers.
 * Computes which hours had pre-alert events, then overlays amber diamond
 * indicators above the chart.
 */
export default function AlertTimelineWithPreAlerts({ alerts, preAlerts }: Props) {
  const { t } = useTranslation();

  if (preAlerts.length === 0) {
    return <AlertTimeline alerts={alerts} />;
  }

  // Build a set of hour offsets (0 = current hour, 1 = 1 hour ago, etc.) that had pre-alerts
  const now = new Date();
  const preAlertHours = new Set<number>();

  for (const pa of preAlerts) {
    const paDate = new Date(pa.timestamp * 1000);
    const hoursAgo = Math.floor((now.getTime() - paDate.getTime()) / (1000 * 60 * 60));
    if (hoursAgo >= 0 && hoursAgo < 24) {
      preAlertHours.add(hoursAgo);
    }
  }

  // The timeline renders 24 buckets, index 0 = 23 hours ago, index 23 = current hour
  // So hoursAgo=0 maps to index 23, hoursAgo=1 maps to index 22, etc.
  const markerIndices: number[] = [];
  preAlertHours.forEach((hoursAgo) => {
    markerIndices.push(23 - hoursAgo);
  });

  return (
    <div className="relative w-full">
      <AlertTimeline alerts={alerts} />
      {/* Overlay row of pre-alert markers */}
      <div className="absolute top-[52px] left-[38px] right-[12px] h-4 pointer-events-none flex">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-center justify-center">
            {markerIndices.includes(i) && (
              <span
                className="inline-block w-2 h-2 bg-amber-400 rotate-45 opacity-80"
                title={t("prealert.timelineMarker")}
              />
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      {markerIndices.length > 0 && (
        <div className="flex items-center justify-end gap-1.5 px-4 mt-1">
          <span className="inline-block w-1.5 h-1.5 bg-amber-400 rotate-45 opacity-80" />
          <span className="font-mono text-[10px] text-cream/30">{t("prealert.timelineMarker")}</span>
        </div>
      )}
    </div>
  );
}
