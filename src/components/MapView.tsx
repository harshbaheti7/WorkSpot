"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
}

export default function MapView({ points }: { points: MapPoint[] }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { scrollWheelZoom: false }).setView(
      [37.76, -122.44],
      12
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    const bounds: [number, number][] = [];
    for (const p of points) {
      bounds.push([p.lat, p.lng]);
      L.circleMarker([p.lat, p.lng], {
        radius: 6 + Math.round(p.score / 25),
        color: "#e88e2e",
        weight: 2,
        fillColor: "#e88e2e",
        fillOpacity: 0.85,
      })
        .bindPopup(`<a href="/cafes/${p.id}"><strong>${p.name}</strong></a>`)
        .addTo(layer);
    }
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
    return () => {
      layer.remove();
    };
  }, [points]);

  return <div ref={divRef} className="h-full min-h-[320px] w-full" />;
}
