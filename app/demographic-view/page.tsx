"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, DemographicBreakdown } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Users, DollarSign, TrendingUp, Zap, BarChart3, Target } from 'lucide-react';

export default function DemographicView() {
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

  const demographicStats = useMemo(() => {
    if (!marketingData) return null;

    let maleClicks = 0, maleSpend = 0, maleRevenue = 0;
    let femaleClicks = 0, femaleSpend = 0, femaleRevenue = 0;
    const ageGroupData: { [key: string]: { spend: number; revenue: number; impressions: number; clicks: number; conversions: number; } } = {};
    const maleAgeGroupPerformance: { [key: string]: any } = {};
    const femaleAgeGroupPerformance: { [key: string]: any } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(breakdown => {
        const { gender, age_group, performance } = breakdown;
        const spend = (campaign.spend * breakdown.percentage_of_audience) / 100;
        const revenue = (campaign.revenue * breakdown.percentage_of_audience) / 100;

        if (gender === 'Male') {
          maleClicks += performance.clicks;
          maleSpend += spend;
          maleRevenue += revenue;
          if (!maleAgeGroupPerformance[age_group]) {
            maleAgeGroupPerformance[age_group] = { impressions: 0, clicks: 0, conversions: 0 };
          }
          maleAgeGroupPerformance[age_group].impressions += performance.impressions;
          maleAgeGroupPerformance[age_group].clicks += performance.clicks;
          maleAgeGroupPerformance[age_group].conversions += performance.conversions;
        } else if (gender === 'Female') {
          femaleClicks += performance.clicks;
          femaleSpend += spend;
          femaleRevenue += revenue;
          if (!femaleAgeGroupPerformance[age_group]) {
            femaleAgeGroupPerformance[age_group] = { impressions: 0, clicks: 0, conversions: 0 };
          }
          femaleAgeGroupPerformance[age_group].impressions += performance.impressions;
          femaleAgeGroupPerformance[age_group].clicks += performance.clicks;
          femaleAgeGroupPerformance[age_group].conversions += performance.conversions;
        }

        if (!ageGroupData[age_group]) {
          ageGroupData[age_group] = { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 };
        }
        ageGroupData[age_group].spend += spend;
        ageGroupData[age_group].revenue += revenue;
      });
    });

    const formatTableData = (performanceData: any) => {
        return Object.entries(performanceData).map(([age_group, data]: [string, any]) => ({
            age_group,
            impressions: data.impressions,
            clicks: data.clicks,
            conversions: data.conversions,
            ctr: data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) + '%' : '0.00%',
            conversion_rate: data.clicks > 0 ? ((data.conversions / data.clicks) * 100).toFixed(2) + '%' : '0.00%',
        }));
    }

    return {
      maleClicks, maleSpend, maleRevenue,
      femaleClicks, femaleSpend, femaleRevenue,
      ageGroupChart: Object.entries(ageGroupData).map(([age_group, data]) => ({ age_group, ...data })),
      maleAgeGroupTable: formatTableData(maleAgeGroupPerformance),
      femaleAgeGroupTable: formatTableData(femaleAgeGroupPerformance),
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
                          <h1 className="text-3xl md:text-5xl font-bold">Demographic View</h1>
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
      
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">Demographic View</h1>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {demographicStats && (
            <>
              {/* Gender Metrics */}
              <h2 className="text-xl font-semibold text-white mb-4">Performance by Gender</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <CardMetric title="Total Clicks by Males" value={demographicStats.maleClicks.toLocaleString()} icon={<Zap className="h-5 w-5" />} />
                <CardMetric title="Total Spend by Males" value={`$${demographicStats.maleSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Total Revenue by Males" value={`$${demographicStats.maleRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<TrendingUp className="h-5 w-5" />} className="text-green-400" />
                <CardMetric title="Total Clicks by Females" value={demographicStats.femaleClicks.toLocaleString()} icon={<Zap className="h-5 w-5" />} />
                <CardMetric title="Total Spend by Females" value={`$${demographicStats.femaleSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Total Revenue by Females" value={`$${demographicStats.femaleRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<TrendingUp className="h-5 w-5" />} className="text-green-400" />
              </div>

              {/* Age Group Charts */}
              <h2 className="text-xl font-semibold text-white mb-4">Performance by Age Group</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={demographicStats.ageGroupChart.map(item => ({ label: item.age_group, value: item.spend, color: '#3B82F6' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <BarChart
                  title="Total Revenue by Age Group"
                  data={demographicStats.ageGroupChart.map(item => ({ label: item.age_group, value: item.revenue, color: '#10B981' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
              </div>

              {/* Age Group Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Table
                  title="Campaign Performance by Male Age Groups"
                  columns={[
                    { key: 'age_group', header: 'Age Group', sortable: true, sortType: 'string' },
                    { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'ctr', header: 'CTR', sortable: true, sortType: 'string', align: 'right' },
                    { key: 'conversion_rate', header: 'Conv. Rate', sortable: true, sortType: 'string', align: 'right' },
                  ]}
                  data={demographicStats.maleAgeGroupTable}
                   defaultSort={{ key: 'impressions', direction: 'desc' }}
                />
                <Table
                  title="Campaign Performance by Female Age Groups"
                  columns={[
                    { key: 'age_group', header: 'Age Group', sortable: true, sortType: 'string' },
                    { key: 'impressions', header: 'Impressions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'clicks', header: 'Clicks', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'conversions', header: 'Conversions', sortable: true, sortType: 'number', align: 'right', render: (v) => v.toLocaleString() },
                    { key: 'ctr', header: 'CTR', sortable: true, sortType: 'string', align: 'right' },
                    { key: 'conversion_rate', header: 'Conv. Rate', sortable: true, sortType: 'string', align: 'right' },
                  ]}
                  data={demographicStats.femaleAgeGroupTable}
                  defaultSort={{ key: 'impressions', direction: 'desc' }}
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

