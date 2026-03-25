"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Header,
  SafetyVerdict,
  InstallPrompt,
  StatsGrid,
  AlertTimeline,
  HowItWorks,
  Footer,
  ScrollReveal,
  CrossPromoBanner,
  computeStats,
  computePreAlertStatus,
  filterAlertsByRegion,
  detectRegionFromCoordinates,
  regions,
  useTranslation,
  type ProcessedAlert,
  type SafetyStats,
  type SafetyRecommendation,
  type PreAlert,
  type PreAlertStatus,
} from "best-time-ui";
import WalkSettings from "@/components/WalkSettings";
import LocationDisplay from "@/components/LocationDisplay";
import NearestShelters from "@/components/NearestShelters";
import LocationSelector from "@/components/LocationSelector";
import { PreAlertCard } from "best-time-ui";
import { getWalkRecommendation } from "@/lib/safety";
import { useGeolocation } from "@/hooks/useGeolocation";
import { NearestShelter as NearestShelterType } from "@/lib/types";

const REFRESH_INTERVAL = 120_000;

export default function Home() {
  const [alerts, setAlerts] = useState<ProcessedAlert[]>([]);
  const [preAlerts, setPreAlerts] = useState<PreAlert[]>([]);
  const [preAlertStatus, setPreAlertStatus] = useState<PreAlertStatus | null>(null);
  const [stats, setStats] = useState<SafetyStats | null>(null);
  const [recommendation, setRecommendation] = useState<SafetyRecommendation | null>(null);
  const [duration, setDuration] = useState(15);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [nearbyShelters, setNearbyShelters] = useState<NearestShelterType[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(false);
  const [shelterCoverage, setShelterCoverage] = useState<{ covered: boolean; area?: string } | null>(null);
  const [regionAutoDetected, setRegionAutoDetected] = useState(false);
  const { t } = useTranslation();

  const { location, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // Persist region in localStorage
  useEffect(() => {
    const savedRegion = localStorage.getItem("bwt-region");
    if (savedRegion) setSelectedRegion(savedRegion);
  }, []);

  useEffect(() => {
    localStorage.setItem("bwt-region", selectedRegion);
  }, [selectedRegion]);

  // Auto-detect region from geolocation
  useEffect(() => {
    if (!location) return;
    const detected = detectRegionFromCoordinates(location.lat, location.lng);
    if (detected !== "all") {
      setSelectedRegion(detected);
      setRegionAutoDetected(true);
    }
  }, [location]);

  // Fetch nearby shelters when location changes
  useEffect(() => {
    if (!location) return;

    setSheltersLoading(true);
    fetch(`/api/shelters?lat=${location.lat}&lng=${location.lng}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        setNearbyShelters(data.nearest || []);
        setShelterCoverage(data.coverage || null);
      })
      .catch(() => {
        setNearbyShelters([]);
      })
      .finally(() => {
        setSheltersLoading(false);
      });
  }, [location]);

  const handleRegionChange = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setRegionAutoDetected(false);
  }, []);

  const detectedRegionName = regionAutoDetected
    ? regions.find((r) => r.id === selectedRegion)?.nameEn ?? null
    : null;

  // Filter alerts by selected region
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => filterAlertsByRegion(a.cities, selectedRegion));
  }, [alerts, selectedRegion]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data: ProcessedAlert[] = await res.json();
      setAlerts(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, []);

  const fetchPreAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/pre-alerts");
      const data: PreAlert[] = await res.json();
      setPreAlerts(data);
    } catch {
      // Pre-alerts are optional — fail silently
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAlerts();
    fetchPreAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchPreAlerts();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts, fetchPreAlerts]);

  // Compute pre-alert status when pre-alerts or region change
  useEffect(() => {
    if (preAlerts.length === 0) {
      setPreAlertStatus(null);
      return;
    }
    const regionId = selectedRegion === "all" ? null : selectedRegion;
    setPreAlertStatus(computePreAlertStatus(preAlerts, regionId));
  }, [preAlerts, selectedRegion]);

  // Recompute stats when filtered alerts, duration, shelters, or pre-alert status change
  useEffect(() => {
    const newStats = computeStats(filteredAlerts);
    setStats(newStats);

    const nearestShelter = nearbyShelters.length > 0 ? nearbyShelters[0] : null;
    setRecommendation(getWalkRecommendation(newStats, duration, nearestShelter, preAlertStatus));
  }, [filteredAlerts, duration, nearbyShelters, preAlertStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-xl">
        <ScrollReveal direction="down">
          <Header />
        </ScrollReveal>
        <CrossPromoBanner
          sites={[
            { href: "https://bestshowertime.com", name: "Best Shower Time", promptEn: "Need a shower? Check out", promptHe: "צריכים להתקלח? בדקו את" },
            { href: "https://bestsleepingtime.com", name: "Best Sleep Time", promptEn: "Need a nap? Check out", promptHe: "צריכים תנומה? בדקו את" },
          ]}
        />

        <main className="flex flex-col items-center gap-10 pb-10">
          <ScrollReveal>
            <div className="flex flex-col items-center">
              <SafetyVerdict recommendation={recommendation} />
              {preAlertStatus && (
                <div className="flex items-center gap-1.5 mt-[-8px]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                  <span className="font-mono text-[10px] text-amber-300/50 uppercase tracking-wider">
                    {t("prealert.includesIntel")}
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>
          {preAlertStatus && preAlertStatus.warningCount2h >= 2 && (
            <div className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-600/40 text-amber-200 text-sm text-center">
              {t("prealert.shorterWalk")}
            </div>
          )}
          {preAlertStatus && preAlertStatus.hasRecentExit && !preAlertStatus.hasActiveWarning && stats && (
            <div className="w-full px-4 py-3 rounded-lg bg-emerald-900/30 border border-emerald-600/40 text-emerald-200 text-sm text-center">
              {t("prealert.departureWindow")
                .replace("{gap}", stats.averageGap === Infinity ? "—" : String(Math.round(stats.averageGap)))
                .replace("{duration}", String(duration))}
            </div>
          )}
          <ScrollReveal direction="left" delay={100}>
            <WalkSettings
              duration={duration}
              onDurationChange={setDuration}
            />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={50}>
            <LocationDisplay
              location={location}
              loading={geoLoading}
              error={geoError}
              onLocate={requestLocation}
              detectedRegion={detectedRegionName}
            />
          </ScrollReveal>
          {(nearbyShelters.length > 0 || sheltersLoading || shelterCoverage) && (
            <ScrollReveal delay={100}>
              <NearestShelters
                shelters={nearbyShelters}
                loading={sheltersLoading}
                coverage={shelterCoverage}
              />
            </ScrollReveal>
          )}
          <ScrollReveal direction="right" delay={50}>
            <InstallPrompt />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <LocationSelector
              selectedRegion={selectedRegion}
              onRegionChange={handleRegionChange}
              autoDetected={regionAutoDetected}
            />
          </ScrollReveal>
          <ScrollReveal delay={150} className="w-full">
            <StatsGrid stats={stats} />
          </ScrollReveal>
          {preAlertStatus && (
            <ScrollReveal>
              <PreAlertCard
                preAlertStatus={preAlertStatus}
                preAlerts={preAlerts}
              />
            </ScrollReveal>
          )}
          <ScrollReveal delay={100} className="w-full">
            <AlertTimeline alerts={filteredAlerts} preAlerts={preAlerts} />
          </ScrollReveal>
          <ScrollReveal>
            <HowItWorks />
          </ScrollReveal>
        </main>

        <ScrollReveal>
          <Footer
            lastUpdated={lastUpdated}
            sisterSites={[
              {
                href: "https://bestshowertime.com",
                nameEn: "Best Shower Time",
                nameHe: "הזמן הטוב למקלחת",
              },
              {
                href: "https://bestsleepingtime.com",
                nameEn: "Best Sleep Time",
                nameHe: "הזמן הטוב לשינה",
              },
            ]}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
