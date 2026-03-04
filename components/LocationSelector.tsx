"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { regions, Region } from "@/lib/regions";
import { useHaptics } from "@/lib/haptics";

interface Props {
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
  autoDetected?: boolean;
}

export default function LocationSelector({
  selectedRegion,
  onRegionChange,
  autoDetected = false,
}: Props) {
  const { lang } = useLanguage();
  const { trigger } = useHaptics();
  const [expanded, setExpanded] = useState(false);

  const regionName = (r: Region) => (lang === "he" ? r.nameHe : r.nameEn);
  const selected = regions.find((r) => r.id === selectedRegion);

  if (autoDetected && !expanded) {
    return (
      <section className="w-full max-w-md mx-auto px-4">
        <div className="card px-5 py-5">
          <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
            {t(lang, "region")}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-cream">
              {selected ? regionName(selected) : selectedRegion}
            </span>
            <button
              onClick={() => setExpanded(true)}
              className="font-mono text-xs text-cream/40 hover:text-cream/70 underline underline-offset-2 transition-colors duration-300"
            >
              {t(lang, "regionChange")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className="card px-5 py-5">
        <span className="font-mono text-xs text-cream/40 uppercase tracking-wider block mb-3">
          {t(lang, "region")}
        </span>

        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                trigger("selection");
                onRegionChange(r.id);
                setExpanded(false);
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all duration-500 ease-smooth ${
                selectedRegion === r.id
                  ? "bg-surface-2 text-cream"
                  : "text-cream/35 hover:bg-surface-1"
              }`}
            >
              {regionName(r)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
