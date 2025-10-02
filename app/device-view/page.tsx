"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, DevicePerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Smartphone, Monitor, DollarSign, TrendingUp, Zap, Target } from 'lucide-react';

export default function DeviceView() {
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
  
  const deviceStats = useMemo(() => {
    if (!marketingData) return null;

    const aggregated: { [device: string]: Partial<DevicePerformance> & { total_spend: number, total_revenue: number } } = {
        Mobile: { impressions: 0, clicks: 0, conversions: 0, total_spend: 0, total_revenue: 0 },
        Desktop: { impressions: 0, clicks: 0, conversions: 0, total_spend: 0, total_revenue: 0 },
    };

    marketingData.campaigns.forEach(campaign => {
        campaign.device_performance.forEach(perf => {
            if (aggregated[perf.device]) {
                aggregated[perf.device].impressions! += perf.impressions;
                aggregated[perf.device].clicks! += perf.clicks;
                aggregated[perf.device].conversions! += perf.conversions;
                aggregated[perf.device].total_spend += perf.spend;
                aggregated[perf.device].total_revenue += perf.revenue;
            }
        });
    });

    const tableData = Object.entries(aggregated).map(([device, data]) => ({
      device,
      ...data,
      ctr: data.impressions! > 0 ? ((data.clicks! / data.impressions!) * 100).toFixed(2) + '%' : '0.00%',
      conversion_rate: data.clicks! > 0 ? ((data.conversions! / data.clicks!) * 100).toFixed(2) + '%' : '0.00%',
      roas: data.total_spend > 0 ? (data.total_revenue / data.total_spend).toFixed(2) + 'x' : '0.00x',
    }));

    return {
        mobile: aggregated.Mobile,
        desktop: aggregated.Desktop,
        tableData,
    };

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
                          <h1 className="text-3xl md:text-5xl font-bold">Device View</h1>
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
            <h1 className="text-3xl md:text-5xl font-bold">Device View</h1>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {deviceStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CardMetric title="Mobile Revenue" value={`$${deviceStats.mobile.total_revenue?.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<Smartphone className="h-5 w-5" />} className="text-green-400"/>
                <CardMetric title="Mobile Spend" value={`$${deviceStats.mobile.total_spend?.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<Smartphone className="h-5 w-5" />} />
                <CardMetric title="Desktop Revenue" value={`$${deviceStats.desktop.total_revenue?.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<Monitor className="h-5 w-5" />} className="text-green-400"/>
                <CardMetric title="Desktop Spend" value={`$${deviceStats.desktop.total_spend?.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<Monitor className="h-5 w-5" />} />
              </div>
              
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <BarChart
                    title="Revenue: Mobile vs Desktop"
                    data={[
                        { label: 'Mobile', value: deviceStats.mobile.total_revenue || 0, color: '#3B82F6' },
                        { label: 'Desktop', value: deviceStats.desktop.total_revenue || 0, color: '#10B981' }
                    ]}
                     formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                 <BarChart
                    title="Conversions: Mobile vs Desktop"
                    data={[
                        { label: 'Mobile', value: deviceStats.mobile.conversions || 0, color: '#3B82F6' },
                        { label: 'Desktop', value: deviceStats.desktop.conversions || 0, color: '#10B981' }
                    ]}
                     formatValue={(value) => value.toLocaleString()}
                />
              </div>

              <Table
                  title="Detailed Device Performance"
                  columns={[
                      { key: 'device', header: 'Device', sortable: true, sortType: 'string' },
                      { key: 'total_revenue', header: 'Revenue', sortable: true, sortType: 'number', align: 'right', render: (v) => `$${v.toLocaleString(undefined, {maximumFractionDigits:0})}` },
                      { key: 'total_spend', header: 'Spend', sortable: true, sortType: 'number', align: 'right', render: (v) => `$${v.toLocaleString(undefined, {maximumFractionDigits:0})}` },
                      { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                      { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                      { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                      { key: 'ctr', header: 'CTR', align: 'right' },
                      { key: 'conversion_rate', header: 'Conv. Rate', align: 'right' },
                      { key: 'roas', header: 'ROAS', align: 'right' },
                  ]}
                  data={deviceStats.tableData}
                  maxHeight='none'
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
