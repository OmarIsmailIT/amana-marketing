"use client";
import React from "react";

interface BubbleData {
  region: string;
  value: number;
}

interface BubbleMapProps {
  title: string;
  data: BubbleData[];
  className?: string;
  highColor?: string;
  lowColor?: string;
  formatValue: (value: number) => string;
}

// Coordinates in 1000x500 space
const cityCoordinates: Record<string, { x: number; y: number }> = {
  Dubai: { x: 653, y: 226 },
  Sharjah: { x: 654, y: 225 },
  "Abu Dhabi": { x: 651, y: 228 },
  Riyadh: { x: 630, y: 227 },
  Jeddah: { x: 609, y: 239 },
  Dammam: { x: 639, y: 223 },
  Cairo: { x: 586, y: 209 },
  Alexandria: { x: 583, y: 206 },
  Istanbul: { x: 580, y: 177 },
  Ankara: { x: 589, y: 181 },
};

export function BubbleMap({
  title,
  data,
  className = "",
  highColor = "#10B981",
  lowColor = "#3B82F6",
  formatValue,
}: BubbleMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const getRadius = (value: number) => {
    if (maxValue === minValue) return 8;
    return 3 + Math.log1p(value / maxValue) * 20;
  };

  const getColor = (value: number) => {
    if (maxValue === minValue) return highColor;
    const ratio = (value - minValue) / (maxValue - minValue);
    const r = Math.ceil(
      parseInt(lowColor.substring(1, 3), 16) * (1 - ratio) +
        parseInt(highColor.substring(1, 3), 16) * ratio
    );
    const g = Math.ceil(
      parseInt(lowColor.substring(3, 5), 16) * (1 - ratio) +
        parseInt(highColor.substring(3, 5), 16) * ratio
    );
    const b = Math.ceil(
      parseInt(lowColor.substring(5, 7), 16) * (1 - ratio) +
        parseInt(highColor.substring(5, 7), 16) * ratio
    );
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const bubbles = data
    .map((item) => ({
      ...item,
      coords: cityCoordinates[item.region],
      radius: getRadius(item.value),
      color: getColor(item.value),
    }))
    .filter((item) => item.coords)
    .sort((a, b) => b.value - a.value);

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative w-full aspect-[2/1]">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          {/* Background world map */}
          <image
            href="/world-map.svg"
            x="0"
            y="0"
            width="1000"
            height="500"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Bubbles */}
          {bubbles.map(({ region, value, coords, radius, color }) => (
            <g key={region} className="transition-transform duration-300 hover:scale-110">
              <circle
                cx={coords!.x}
                cy={coords!.y}
                r={radius}
                fill={color}
                fillOpacity="0.6"
                stroke={color}
                strokeWidth="1"
              />
              <title>{`${region}: ${formatValue(value)}`}</title>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        *Note: City locations are approximate for visualization purposes.
      </p>
    </div>
  );
}