"use client";

import { useState, useCallback } from "react";
import { UserLocation } from "@/lib/types";

interface GeolocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ location: null, loading: false, error: "Geolocation not supported" });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setState({ location: loc, loading: false, error: null });

        // Save to localStorage
        localStorage.setItem("bwt-location", JSON.stringify(loc));
      },
      (err) => {
        let errorMsg = "Could not get location";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "denied";
        }
        setState({ location: null, loading: false, error: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return { ...state, requestLocation };
}
