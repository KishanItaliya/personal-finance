// services/forecastingService.ts

import { Transaction } from '@prisma/client';
import { RecurringPattern } from './patternDetectionService';

export interface MonthlyForecast {
  month: string; // YYYY-MM format
  predictedIncome: number;
  predictedExpenses: number;
  predictedSavings: number;
  confidenceScore: number;
}

export interface CategoryForecast {
  categoryId: string;
  categoryName: string;
  currentMonthPrediction: number;
  nextMonthPrediction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidenceScore: number;
}

export class ForecastingService {
  // Generate spending forecast for the next few months
  generateMonthlyForecast(
    transactions: Transaction[],
    recurringPatterns: RecurringPattern[],
    monthsToForecast: number = 3
  ): MonthlyForecast[] {
    const forecasts: MonthlyForecast[] = [];
    
    // 1. Analyze historical monthly totals
    const historicalMonthly = this.calculateHistoricalMonthlyTotals(transactions);
    
    // 2. Calculate trend using simple linear regression
    const trend = this.calculateTrend(historicalMonthly);
    
    // 3. Calculate predicted values for upcoming months using trend and recurring patterns
    const currentDate = new Date();
    for (let i = 1; i <= monthsToForecast; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastMonthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Base forecast on trend
      let predictedIncome = trend.income.base + trend.income.slope * (historicalMonthly.length + i);
      let predictedExpenses = trend.expenses.base + trend.expenses.slope * (historicalMonthly.length + i);
      
      // Include recurring transactions
      const recurringIncomeForMonth = this.predictRecurringForMonth(recurringPatterns, forecastDate, 'INCOME');
      const recurringExpensesForMonth = this.predictRecurringForMonth(recurringPatterns, forecastDate, 'EXPENSE');
      
      predictedIncome += recurringIncomeForMonth;
      predictedExpenses += recurringExpensesForMonth;
      
      // Ensure predictions are not negative
      predictedIncome = Math.max(0, predictedIncome);
      predictedExpenses = Math.max(0, predictedExpenses);
      
      const predictedSavings = predictedIncome - predictedExpenses;
      
      // Calculate confidence score based on historical data consistency and trend strength
      const confidenceScore = this.calculateConfidenceScore(
        historicalMonthly, 
        trend, 
        i, // confidence decreases with forecast distance
        recurringPatterns
      );
      
      forecasts.push({
        month: forecastMonthKey,
        predictedIncome,
        predictedExpenses,
        predictedSavings,
        confidenceScore
      });
    }
    
    return forecasts;
  }
  
  // Generate category-specific forecasts
  generateCategoryForecasts(
    transactions: Transaction[],
    categories: { id: string, name: string }[]
  ): CategoryForecast[] {
    const forecasts: CategoryForecast[] = [];
    
    // Process each category
    for (const category of categories) {
      // Filter transactions for this category
      const categoryTxs = transactions.filter(tx => tx.categoryId === category.id && tx.type === 'EXPENSE');
      if (categoryTxs.length < 3) continue; // Need sufficient data
      
      // Group by month
      const monthlyTotals = categoryTxs.reduce((acc, tx) => {
        const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += Number(tx.amount);
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to array for trend analysis
      const monthlyData = Object.entries(monthlyTotals)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      if (monthlyData.length < 2) continue;
      
      // Calculate trend using simple linear regression
      const xValues = monthlyData.map((_, i) => i);
      const yValues = monthlyData.map(d => d.total);
      
      const n = xValues.length;
      const sumX = xValues.reduce((a, b) => a + b, 0);
      const sumY = yValues.reduce((a, b) => a + b, 0);
      const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
      const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Predict current and next month
      const currentMonthIndex = monthlyData.length;
      const nextMonthIndex = monthlyData.length + 1;
      
      const currentMonthPrediction = intercept + slope * currentMonthIndex;
      const nextMonthPrediction = intercept + slope * nextMonthIndex;
      
      // Determine trend direction
      let trend: CategoryForecast['trend'] = 'stable';
      if (slope > 0.05 * (sumY / n)) trend = 'increasing';
      if (slope < -0.05 * (sumY / n)) trend = 'decreasing';
      
      // Calculate r-squared for confidence
      const meanY = sumY / n;
      const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
      const predictedValues = xValues.map(x => intercept + slope * x);
      const residualSumSquares = yValues.reduce((sum, y, i) => sum + Math.pow(y - predictedValues[i], 2), 0);
      const rSquared = 1 - (residualSumSquares / totalSumSquares);
      
      // Adjust confidence based on data quantity and quality
      let confidenceScore = rSquared * 0.8 + (Math.min(1, monthlyData.length / 12) * 0.2);
      confidenceScore = Math.max(0, Math.min(0.95, confidenceScore)); // Cap between 0 and 0.95
      
      forecasts.push({
        categoryId: category.id,
        categoryName: category.name,
        currentMonthPrediction: Math.max(0, currentMonthPrediction), // No negative spending
        nextMonthPrediction: Math.max(0, nextMonthPrediction),
        trend,
        confidenceScore
      });
    }
    
    return forecasts;
  }
  
  // Helper methods
  private calculateHistoricalMonthlyTotals(transactions: Transaction[]) {
    // Group transactions by month and type
    const monthly = transactions.reduce((acc, tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (tx.type === 'INCOME') {
        acc[monthKey].income += Number(tx.amount);
      } else if (tx.type === 'EXPENSE') {
        acc[monthKey].expenses += Number(tx.amount);
      }
      
      return acc;
    }, {} as Record<string, { income: number, expenses: number }>);
    
    // Convert to array and sort by month
    return Object.entries(monthly)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  
  private calculateTrend(monthlyData: Array<{ month: string, income: number, expenses: number }>) {
    const n = monthlyData.length;
    if (n < 2) return { income: { base: 0, slope: 0 }, expenses: { base: 0, slope: 0 } };
    
    const xValues = monthlyData.map((_, i) => i);
    const yIncomeValues = monthlyData.map(d => d.income);
    const yExpenseValues = monthlyData.map(d => d.expenses);
    
    // For income
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumYIncome = yIncomeValues.reduce((a, b) => a + b, 0);
    const sumXYIncome = xValues.reduce((sum, x, i) => sum + x * yIncomeValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const incomeSlope = (n * sumXYIncome - sumX * sumYIncome) / (n * sumXX - sumX * sumX);
    const incomeBase = (sumYIncome - incomeSlope * sumX) / n;
    
    // For expenses
    const sumYExpense = yExpenseValues.reduce((a, b) => a + b, 0);
    const sumXYExpense = xValues.reduce((sum, x, i) => sum + x * yExpenseValues[i], 0);
    
    const expenseSlope = (n * sumXYExpense - sumX * sumYExpense) / (n * sumXX - sumX * sumX);
    const expenseBase = (sumYExpense - expenseSlope * sumX) / n;
    
    return {
      income: { base: incomeBase, slope: incomeSlope },
      expenses: { base: expenseBase, slope: expenseSlope }
    };
  }
  
  private predictRecurringForMonth(
    patterns: RecurringPattern[], 
    targetMonth: Date, 
    type: 'INCOME' | 'EXPENSE'
  ): number {
    let total = 0;
    
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    
    patterns.forEach(pattern => {
      // Check if pattern is for the correct transaction type
      if (pattern.transactions[0].type !== type) return;
      
      // Skip low confidence patterns
      if (pattern.confidenceScore < 0.7) return;
      
      const lastTxDate = pattern.lastTransactionDate;
      const nextDate = pattern.nextPredictedDate;
      
      if (!nextDate) return;
      
      // For monthly patterns, check if payment falls in target month
      if (pattern.frequency === 'monthly') {
        // Check if the next predicted date falls within target month
        if (nextDate >= firstDay && nextDate <= lastDay) {
          total += pattern.averageAmount;
        } else {
          // Check if a future occurrence falls in target month
          const monthsDiff = (targetMonth.getFullYear() - lastTxDate.getFullYear()) * 12 + 
                             (targetMonth.getMonth() - lastTxDate.getMonth());
          
          if (monthsDiff > 0 && monthsDiff % 1 === 0) {
            total += pattern.averageAmount;
          }
        }
      } 
      // For weekly patterns, count occurrences in the month
      else if (pattern.frequency === 'weekly') {
        let occurrences = 0;
        const checkDate = new Date(nextDate);
        
        while (checkDate <= lastDay) {
          if (checkDate >= firstDay) {
            occurrences++;
          }
          checkDate.setDate(checkDate.getDate() + 7);
        }
        
        total += pattern.averageAmount * occurrences;
      }
      // For yearly patterns
      else if (pattern.frequency === 'yearly') {
        const monthsDiff = (targetMonth.getFullYear() - lastTxDate.getFullYear()) * 12 + 
                           (targetMonth.getMonth() - lastTxDate.getMonth());
        
        if (monthsDiff % 12 === 0) {
          total += pattern.averageAmount;
        }
      }
    });
    
    return total;
  }
  
  private calculateConfidenceScore(
    historicalData: Array<{ month: string, income: number, expenses: number }>,
    trend: { income: { base: number, slope: number }, expenses: { base: number, slope: number } },
    forecastDistance: number,
    recurringPatterns: RecurringPattern[]
  ): number {
    // Base confidence on:
    // 1. Amount of historical data
    const dataPoints = historicalData.length;
    const dataPointsScore = Math.min(1, dataPoints / 12); // Max score at 1 year of data
    
    // 2. Consistency of historical data (variance)
    const incomeValues = historicalData.map(d => d.income);
    const expenseValues = historicalData.map(d => d.expenses);
    
    const incomeVariance = this.calculateVariance(incomeValues);
    const expenseVariance = this.calculateVariance(expenseValues);
    
    const varianceScore = Math.max(0, 1 - (incomeVariance + expenseVariance) / 2);
    
    // 3. Strength of recurring patterns
    const recurringScore = recurringPatterns.length > 0 ? 
      recurringPatterns.reduce((sum, p) => sum + p.confidenceScore, 0) / recurringPatterns.length : 0;
    
    // 4. Distance of forecast (farther = less confident)
    const distanceScore = Math.max(0, 1 - (forecastDistance * 0.1));
    
    // Weighted combination
    const confidenceScore = (
      dataPointsScore * 0.3 + 
      varianceScore * 0.2 + 
      recurringScore * 0.3 + 
      distanceScore * 0.2
    );
    
    return Math.min(0.95, Math.max(0.3, confidenceScore)); // Limit range to 0.3-0.95
  }
  
  private calculateVariance(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    
    // Normalize by mean to get coefficient of variation
    return variance / (mean * mean);
  }
}