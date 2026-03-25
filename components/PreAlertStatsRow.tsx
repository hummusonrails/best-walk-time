"use client";

import { useTranslation, type PreAlertStatus } from "best-time-ui";

interface Props {
  preAlertStatus: PreAlertStatus;
}

export default function PreAlertStatsRow({ preAlertStatus }: Props) {
  const { t } = useTranslation();

  const { warningCount6h, lastWarningMinutesAgo } = preAlertStatus;

  return (
    <div className="w-full px-4">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-950/20 border border-amber-500/15">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="font-mono text-xs text-amber-200/70">
          {warningCount6h} {t("prealert.warnings")} ({t("prealert.last6h")})
        </span>
        {lastWarningMinutesAgo !== null && (
          <>
            <span className="text-cream/15">|</span>
            <span className="font-mono text-xs text-cream/40">
              {t("prealert.lastWarning")}: {t("prealert.minutesAgo").replace("{min}", String(Math.round(lastWarningMinutesAgo)))}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
