"use client";

import { useTranslation } from "best-time-ui";
import { NearestShelter } from "@/lib/types";
import { formatDistance } from "@/lib/geo";

interface Props {
  shelters: NearestShelter[];
  loading: boolean;
  coverage?: { covered: boolean; area?: string } | null;
}

export default function NearestShelters({ shelters, loading, coverage }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <section className="w-full max-w-md mx-auto px-4">
        <div className="card px-5 py-5">
          <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
            {t("shelters")}
          </span>
          <div className="animate-pulse space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 bg-cream/5 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (shelters.length === 0) {
    return (
      <section className="w-full max-w-md mx-auto px-4">
        <div className="card px-5 py-5">
          <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
            {t("shelters")}
          </span>
          <p className="font-mono text-sm text-cream/30 text-center py-2">
            {t("noShelters")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className="card px-5 py-5">
        <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
          {t("shelters")}
        </span>
        <div className="space-y-2">
          {shelters.map((shelter, i) => (
            <a
              key={shelter.id}
              href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-2 hover:bg-cream/5 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <span className={`font-mono text-xs w-5 text-center ${
                  i === 0 ? "text-safety" : "text-cream/40"
                }`}>
                  {i + 1}
                </span>
                <div>
                  <p className="font-mono text-sm text-cream/80 group-hover:text-cream transition-colors">
                    {shelter.name || shelter.address || `${t("nearestShelter")} #${i + 1}`}
                  </p>
                  {shelter.address && shelter.name && (
                    <p className="font-mono text-xs text-cream/30">{shelter.address}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-mono text-sm ${i === 0 ? "text-cream" : "text-cream/60"}`}>
                  {formatDistance(shelter.distanceM)}
                </span>
                <span className="font-mono text-xs text-cream/30">
                  {shelter.walkMinutes} {t("minutes")} {t("walkTime")}
                </span>
              </div>
            </a>
          ))}
        </div>
        {coverage && !coverage.covered && (
          <p className="font-mono text-xs text-cream/30 text-center mt-3 leading-relaxed">
            {t("shelterLimitedCoverage")}
          </p>
        )}
      </div>
    </section>
  );
}
