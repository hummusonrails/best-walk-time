"use client";

import { useLanguage, useTranslation, useHaptics } from "best-time-ui";
import { UserLocation } from "@/lib/types";

interface Props {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  onLocate: () => void;
  detectedRegion?: string | null;
}

export default function LocationDisplay({ location, loading, error, onLocate, detectedRegion }: Props) {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const { trigger } = useHaptics();

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className="card px-5 py-5">
        <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
          {t("location")}
        </span>

        {location ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-safety text-lg">&#9679;</span>
              <span className="font-mono text-sm text-cream">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
              {detectedRegion && (
                <span className="font-mono text-xs text-cream/40">
                  · {detectedRegion}
                </span>
              )}
              {location.accuracy && (
                <span className="font-mono text-xs text-cream/30">
                  ±{Math.round(location.accuracy)}m
                </span>
              )}
            </div>
            <button
              onClick={() => { trigger("light"); onLocate(); }}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-2 hover:bg-cream/10 text-cream/60 hover:text-cream transition-colors duration-300"
            >
              {loading ? t("locating") : t("locateMe")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            {error === "denied" ? (
              <p className="font-mono text-xs text-warning/70 text-center">
                {t("locationDenied")}
              </p>
            ) : error ? (
              <p className="font-mono text-xs text-danger/70 text-center">
                {t("locationError")}
              </p>
            ) : null}
            <button
              onClick={() => { trigger("light"); onLocate(); }}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-2 hover:bg-cream/10 text-cream/70 hover:text-cream font-mono text-sm transition-all duration-300 disabled:opacity-40"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
              </svg>
              {loading ? t("locating") : t("locateMe")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
