"use client";

import { useTranslation, useHaptics } from "best-time-ui";

interface Props {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export default function WalkSettings({ duration, onDurationChange }: Props) {
  const { t } = useTranslation();
  const { trigger } = useHaptics();

  return (
    <section className="w-full max-w-md mx-auto px-4">
      <div className="card px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider">
            {t("walkDuration")}
          </span>
          <span className="font-mono text-lg text-cream">
            {duration} {t("minutes")}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          value={duration}
          onChange={(e) => { trigger("selection"); onDurationChange(Number(e.target.value)); }}
          className="slider w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-xs text-cream/30">5</span>
          <span className="font-mono text-xs text-cream/30">60</span>
        </div>
      </div>
    </section>
  );
}
