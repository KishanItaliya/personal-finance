import AdvancedInsights from '@/components/insights/AdvancedInsights';

export default function AdvancedInsightsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advanced Financial Insights</h1>
        <p className="text-muted-foreground">Pattern detection, anomalies, and forecasts</p>
      </div>
      <AdvancedInsights />
    </>
  );
} 