"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const weeklyStats = useMemo(() => {
    if (!marketingData) return null;

    const weeklyAggregated: { [week_start: string]: { revenue: number; spend: number } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance.forEach(week => {
        if (!weeklyAggregated[week.week_start]) {
          weeklyAggregated[week.week_start] = { revenue: 0, spend: 0 };
        }
        weeklyAggregated[week.week_start].revenue += week.revenue;
        weeklyAggregated[week.week_start].spend += week.spend;
      });
    });
    
    const sortedWeeks = Object.entries(weeklyAggregated)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

    const revenueByWeek = sortedWeeks.map(([week_start, data]) => ({
      x: week_start,
      y: data.revenue,
    }));
    
    const spendByWeek = sortedWeeks.map(([week_start, data]) => ({
      x: week_start,
      y: data.spend,
    }));

    return { revenueByWeek, spendByWeek };
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
                          <h1 className="text-3xl md:text-5xl font-bold">Weekly View</h1>
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
            <h1 className="text-3xl md:text-5xl font-bold">Weekly View</h1>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {weeklyStats && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <LineChart 
                        title="Revenue by Week"
                        data={weeklyStats.revenueByWeek}
                        strokeColor="#10B981"
                        formatY={(value) => `$${(value / 1000).toFixed(0)}k`}
                        formatX={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                     <LineChart 
                        title="Spend by Week"
                        data={weeklyStats.spendByWeek}
                        strokeColor="#3B82F6"
                        formatY={(value) => `$${(value / 1000).toFixed(0)}k`}
                        formatX={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                </div>
            )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
