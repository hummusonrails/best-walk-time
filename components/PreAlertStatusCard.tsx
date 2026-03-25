"use client";

import { useTranslation, type PreAlertStatus, type SafetyStats } from "best-time-ui";

interface Props {
  preAlertStatus: PreAlertStatus;
  stats: SafetyStats | null;
  duration: number;
}

export default function PreAlertStatusCard({ preAlertStatus, stats, duration }: Props) {
  const { t } = useTranslation();

  const {
    warningCount2h,
    warningCount6h,
    hasActiveWarning,
    hasRecentExit,
    lastWarningMinutesAgo,
    lastExitMinutesAgo,
  } = preAlertStatus;

  // Determine the status mode
  const isDepartureWindow = hasRecentExit && !hasActiveWarning;
  const isActiveWarning = hasActiveWarning;

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className={`card px-5 py-5 border ${
        isActiveWarning
          ? "border-amber-500/30 bg-amber-950/20"
          : isDepartureWindow
            ? "border-emerald-500/30 bg-emerald-950/20"
            : "border-amber-500/20"
      }`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-block w-2 h-2 rounded-full ${
            isActiveWarning
              ? "bg-amber-400 animate-pulse"
              : isDepartureWindow
                ? "bg-emerald-400"
                : "bg-amber-400/60"
          }`} />
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider">
            {t("prealert.statusTitle")}
          </span>
        </div>

        {/* Counts row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl text-amber-400">{warningCount2h}</span>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-cream/50">{t("prealert.warnings")}</span>
              <span className="font-mono text-[10px] text-cream/30">{t("prealert.last2h")}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-cream/10" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl text-emerald-400">
              {warningCount6h - warningCount2h > 0
                ? Math.max(0, (lastExitMinutesAgo !== null ? 1 : 0))
                : 0}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-cream/50">{t("prealert.exits")}</span>
              <span className="font-mono text-[10px] text-cream/30">{t("prealert.last6h")}</span>
            </div>
          </div>
          {lastWarningMinutesAgo !== null && (
            <>
              <div className="w-px h-8 bg-cream/10" />
              <div className="flex flex-col">
                <span className="font-mono text-xs text-cream/50">{t("prealert.lastWarning")}</span>
                <span className="font-mono text-sm text-cream/80">
                  {t("prealert.minutesAgo").replace("{min}", String(Math.round(lastWarningMinutesAgo)))}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Status banner */}
        {isActiveWarning && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-600/20">
            <span className="text-amber-400 text-sm">&#9888;</span>
            <span className="font-mono text-xs text-amber-200">{t("prealert.activeWarning")}</span>
          </div>
        )}
        {isDepartureWindow && stats && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-600/20">
            <span className="text-emerald-400 text-sm">&#10003;</span>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-emerald-200">{t("prealert.departureOpen")}</span>
              {stats.averageGap !== Infinity && (
                <span className="font-mono text-[10px] text-emerald-300/60">
                  {t("prealert.estimatedWindow").replace("{gap}", String(Math.round(stats.averageGap)))}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
