"use client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RegionDatum {
  region: string;
  value: number;
  lat: number;
  lng: number;
}

interface RegionMapProps {
  title: string;
  data: RegionDatum[];
  formatValue: (value: number) => string;
  highColor: string;
  lowColor: string;
}

export function RegionMap({ title, data, formatValue, highColor, lowColor }: RegionMapProps) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));

  const scaleColor = (val: number) => {
    const ratio = (val - min) / (max - min || 1);
    return ratio > 0.5 ? highColor : lowColor;
  };

  // Cast center explicitly as LatLngExpression
  const defaultCenter: LatLngExpression = [25, 45];

  return (
    <div className="bg-amana-surface rounded-xl shadow-xl p-4">
      <h2 className="text-xl font-bold mb-4 text-amana-text">{title}</h2>
      <MapContainer
        center={defaultCenter}
        zoom={4}
        style={{ height: "500px", width: "100%" }}
        className="rounded-lg overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((d, i) => {
          const coords: LatLngExpression = [d.lat, d.lng];
          return (
            <CircleMarker
              key={i}
              center={coords}
              radius={10 + (d.value / max) * 20} // radius is valid here
              pathOptions={{ color: scaleColor(d.value), fillOpacity: 0.7 }}
            >
              <Tooltip>
                <div>
                  <strong>{d.region}</strong>
                  <br />
                  {formatValue(d.value)}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}