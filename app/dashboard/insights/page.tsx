// app/dashboard/insights/page.tsx
import InsightsDashboard from '@/components/insights/InsightsDashboard';

export default function InsightsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Insights</h1>
        <p className="text-muted-foreground">Analyze your financial data and discover trends</p>
      </div>
      <InsightsDashboard />
    </>
  );
}