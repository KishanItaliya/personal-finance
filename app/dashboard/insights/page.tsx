// app/dashboard/insights/page.tsx
import InsightsDashboard from '@/components/insights/InsightsDashboard';
import { Button } from '@/components/ui/button';
import { dashboardRoutes } from '@/lib/routes';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InsightsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Insights</h1>
          <p className="text-muted-foreground">Analyze your financial data and discover trends</p>
        </div>
        <Link href={dashboardRoutes.insights.advanced}>
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Advanced Insights</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <InsightsDashboard />
    </>
  );
}