// app/api/insights/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FinancialInsightsService } from '@/services/financialInsightsService';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;
  const months = parseInt(searchParams.get('months') || '6', 10);
  
  const insightsService = new FinancialInsightsService();
  
  try {
    const [
      categorizedSpending,
      monthlySpendingTrend,
      incomeVsExpense
    ] = await Promise.all([
      insightsService.getCategorizedSpending(userId, months),
      insightsService.getMonthlySpendingTrend(userId, months),
      insightsService.getIncomeVsExpense(userId, months)
    ]);
    
    return NextResponse.json({
      categorizedSpending,
      monthlySpendingTrend,
      incomeVsExpense
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}