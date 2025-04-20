// app/api/insights/advanced/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PatternDetectionService, RecurringPattern, AnomalyDetection } from '@/services/patternDetectionService';
import { ForecastingService, MonthlyForecast, CategoryForecast } from '@/services/forecastingService';
import { auth } from '@/auth';
import { Transaction } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';

// Define a type for transactions with related data included
type TransactionWithRelations = Transaction & {
  category?: { id: string; name: string } | null;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;
  const months = parseInt(searchParams.get('months') || '12', 10);
  const forecastMonths = parseInt(searchParams.get('forecastMonths') || '3', 10);
  
  try {
    // Get all user transactions for analysis
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - months))
        }
      },
      include: {
        category: true,
        account: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Get all categories for forecasting
    const categories = await prisma.category.findMany({
      where: { userId }
    });
    
    // Initialize services
    const patternService = new PatternDetectionService();
    const forecastService = new ForecastingService();
    
    // Generate insights
    const recurringPatterns = patternService.detectRecurringTransactions(transactions);
    const anomalies = patternService.detectAnomalies(transactions, recurringPatterns);
    const monthlyForecasts = forecastService.generateMonthlyForecast(
      transactions, 
      recurringPatterns,
      forecastMonths
    );
    const categoryForecasts = forecastService.generateCategoryForecasts(
      transactions,
      categories
    );
    
    // Generate natural language insights based on the data
    const insights = generateNaturalLanguageInsights(
      transactions as TransactionWithRelations[],
      recurringPatterns,
      anomalies,
      monthlyForecasts,
      categoryForecasts
    );
    
    return NextResponse.json({
      recurringPatterns,
      anomalies,
      monthlyForecasts,
      categoryForecasts,
      insights
    });
  } catch (error) {
    console.error('Error generating advanced insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

// Helper function to generate natural language insights
function generateNaturalLanguageInsights(
  transactions: TransactionWithRelations[],
  recurringPatterns: RecurringPattern[],
  anomalies: AnomalyDetection[],
  monthlyForecasts: MonthlyForecast[],
  categoryForecasts: CategoryForecast[]
): string[] {
  const insights: string[] = [];
  
  // Insight 1: Top spending categories
  if (transactions.length > 0) {
    const categorySpending = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((acc, tx) => {
        const categoryName = tx.category?.name || 'Uncategorized';
        if (!acc[categoryName]) acc[categoryName] = 0;
        acc[categoryName] += Number(tx.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sortedCategories.length > 0) {
      insights.push(`Your top spending categories are ${sortedCategories.map(([category, amount]) => 
        `${category} (${formatCurrency(amount)})`).join(', ')}.`);
    }
  }
  
  // Insight 2: Recurring payments
  if (recurringPatterns.length > 0) {
    const monthlySubscriptions = recurringPatterns
      .filter(p => p.frequency === 'monthly')
      .sort((a, b) => b.averageAmount - a.averageAmount);
    
    if (monthlySubscriptions.length > 0) {
      const total = monthlySubscriptions.reduce((sum, p) => sum + p.averageAmount, 0);
      insights.push(`You have ${monthlySubscriptions.length} monthly subscriptions totaling approximately $${total.toFixed(2)} per month.`);
    }
  }
  
  // Insight 3: Anomalies
  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
  if (highSeverityAnomalies.length > 0) {
    insights.push(`We detected ${highSeverityAnomalies.length} unusual transactions that may require your attention.`);
  }
  
  // Insight 4: Savings forecast
  if (monthlyForecasts.length > 0) {
    const nextMonth = monthlyForecasts[0];
    if (nextMonth.predictedSavings > 0) {
      insights.push(`Based on your patterns, we predict you'll save approximately ${formatCurrency(nextMonth.predictedSavings)} next month.`);
    } else {
      insights.push(`Your spending may exceed your income next month by approximately ${formatCurrency(Math.abs(nextMonth.predictedSavings))}.`);
    }
  }
  
  // Insight 5: Category forecasts
  if (categoryForecasts.length > 0) {
    const increasingCategories = categoryForecasts
      .filter(cf => cf.trend === 'increasing')
      .sort((a, b) => b.nextMonthPrediction - a.nextMonthPrediction);
    
    if (increasingCategories.length > 0) {
      const topCategory = increasingCategories[0];
      insights.push(`Your spending in ${topCategory.categoryName} is trending upward and could reach ${formatCurrency(topCategory.nextMonthPrediction)} next month.`);
    }
  }
  
  return insights;
}