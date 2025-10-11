"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
const RegionMap = dynamic(
  () => import("../../src/components/ui/region-map").then(mod => mod.RegionMap),
  { ssr: false }
);

import { cityCoordinates } from "../../src/components/ui/city-coordinates";
import dynamic from "next/dynamic";

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const regionalStats = useMemo(() => {
    if (!marketingData) return null;

    const regionalAggregated: { [region: string]: { revenue: number; spend: number } } = {};

    marketingData.campaigns.forEach((campaign) => {
      campaign.regional_performance.forEach((regionData) => {
        if (!regionalAggregated[regionData.region]) {
          regionalAggregated[regionData.region] = { revenue: 0, spend: 0 };
        }
        regionalAggregated[regionData.region].revenue += regionData.revenue;
        regionalAggregated[regionData.region].spend += regionData.spend;
      });
    });

    const revenueByRegion = Object.entries(regionalAggregated)
      .filter(([region]) => cityCoordinates[region])
      .map(([region, data]) => ({
        region,
        value: data.revenue,
        lat: cityCoordinates[region].lat,
        lng: cityCoordinates[region].lng,
      }));

    const spendByRegion = Object.entries(regionalAggregated)
      .filter(([region]) => cityCoordinates[region])
      .map(([region, data]) => ({
        region,
        value: data.spend,
        lat: cityCoordinates[region].lat,
        lng: cityCoordinates[region].lng,
      }));

    return { revenueByRegion, spendByRegion };
  }, [marketingData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
            <div className="px-6 lg:px-8 text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Region View</h1>
            </div>
          </section>
          <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">Region View</h1>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {regionalStats && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RegionMap
                title="Revenue by Region"
                data={regionalStats.revenueByRegion}
                formatValue={(value) =>
                  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
                highColor="#10B981"
                lowColor="#F59E0B"
              />
              <RegionMap
                title="Spend by Region"
                data={regionalStats.spendByRegion}
                formatValue={(value) =>
                  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
                highColor="#3B82F6"
                lowColor="#EC4899"
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}