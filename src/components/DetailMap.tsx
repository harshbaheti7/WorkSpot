"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./MapView";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-stone-100 text-sm text-stone-500">
      Loading map…
    </div>
  ),
});

export default function DetailMap({ points }: { points: MapPoint[] }) {
  return <MapView points={points} />;
}
