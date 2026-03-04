"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import SafetyVerdict from "@/components/SafetyVerdict";
import WalkSettings from "@/components/WalkSettings";
import LocationDisplay from "@/components/LocationDisplay";
import NearestShelters from "@/components/NearestShelters";
import LocationSelector from "@/components/LocationSelector";
import StatsGrid from "@/components/StatsGrid";
import AlertTimeline from "@/components/AlertTimeline";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import ScrollReveal from "@/components/ScrollReveal";
import { ProcessedAlert, SafetyStats, SafetyRecommendation, NearestShelter as NearestShelterType } from "@/lib/types";
import { computeStats, getWalkRecommendation } from "@/lib/safety";
import { filterAlertsByRegion } from "@/lib/regions";
import { useGeolocation } from "@/hooks/useGeolocation";

const REFRESH_INTERVAL = 30_000;

export default function Home() {
  const [alerts, setAlerts] = useState<ProcessedAlert[]>([]);
  const [stats, setStats] = useState<SafetyStats | null>(null);
  const [recommendation, setRecommendation] = useState<SafetyRecommendation | null>(null);
  const [duration, setDuration] = useState(15);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [nearbyShelters, setNearbyShelters] = useState<NearestShelterType[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(false);

  const { location, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // Persist region in localStorage
  useEffect(() => {
    const savedRegion = localStorage.getItem("bwt-region");
    if (savedRegion) setSelectedRegion(savedRegion);
  }, []);

  useEffect(() => {
    localStorage.setItem("bwt-region", selectedRegion);
  }, [selectedRegion]);

  // Fetch nearby shelters when location changes
  useEffect(() => {
    if (!location) return;

    setSheltersLoading(true);
    fetch(`/api/shelters?lat=${location.lat}&lng=${location.lng}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        setNearbyShelters(data.nearest || []);
      })
      .catch(() => {
        setNearbyShelters([]);
      })
      .finally(() => {
        setSheltersLoading(false);
      });
  }, [location]);

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

  // Initial fetch + polling
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Recompute stats when filtered alerts, duration, or shelters change
  useEffect(() => {
    const newStats = computeStats(filteredAlerts);
    setStats(newStats);

    const nearestShelter = nearbyShelters.length > 0 ? nearbyShelters[0] : null;
    setRecommendation(getWalkRecommendation(newStats, duration, nearestShelter));
  }, [filteredAlerts, duration, nearbyShelters]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-xl">
        <ScrollReveal direction="down">
          <Header />
        </ScrollReveal>

        <main className="flex flex-col items-center gap-10 pb-10">
          <ScrollReveal>
            <SafetyVerdict recommendation={recommendation} />
          </ScrollReveal>
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
            />
          </ScrollReveal>
          {(nearbyShelters.length > 0 || sheltersLoading) && (
            <ScrollReveal delay={100}>
              <NearestShelters
                shelters={nearbyShelters}
                loading={sheltersLoading}
              />
            </ScrollReveal>
          )}
          <ScrollReveal direction="right" delay={50}>
            <InstallPrompt />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <LocationSelector
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </ScrollReveal>
          <ScrollReveal delay={150} className="w-full">
            <StatsGrid stats={stats} />
          </ScrollReveal>
          <ScrollReveal delay={100} className="w-full">
            <AlertTimeline alerts={filteredAlerts} />
          </ScrollReveal>
          <ScrollReveal>
            <HowItWorks />
          </ScrollReveal>
        </main>

        <ScrollReveal>
          <Footer lastUpdated={lastUpdated} />
        </ScrollReveal>
      </div>
    </div>
  );
}
