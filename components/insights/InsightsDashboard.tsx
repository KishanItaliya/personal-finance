"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

// Theme-consistent colors
const THEME_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6'  // teal-500
];

// Define types for the insights data
interface InsightsData {
  categorizedSpending: Record<string, number>;
  monthlySpendingTrend: Record<string, number>;
  incomeVsExpense: {
    income: Record<string, number>;
    expense: Record<string, number>;
  };
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlyTrendData {
  month: string;
  amount: number;
}

interface IncomeExpenseData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

// Helper functions placed outside the component to avoid re-creation on each render
const formatCategoryData = (data: Record<string, number> = {}): CategoryData[] => {
  return Object.entries(data).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));
};

const formatMonthlyTrendData = (data: Record<string, number> = {}): MonthlyTrendData[] => {
  return Object.entries(data)
    .map(([monthKey, amount]) => {
      // Split YYYY-MM format
      const [year, month] = monthKey.split('-');
      return {
        month: `${month}/${year.slice(-2)}`, // Use MM/YY format for cleaner chart
        amount: parseFloat(amount.toFixed(2))
      };
    })
    .sort((a, b) => {
      // Parse month/year for proper chronological sorting
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      return new Date(`20${aYear}-${aMonth}-01`).getTime() - new Date(`20${bYear}-${bMonth}-01`).getTime();
    });
};

const formatIncomeExpenseData = (
  income: Record<string, number> = {}, 
  expense: Record<string, number> = {}
): IncomeExpenseData[] => {
  // Get all unique months from both income and expense
  const months = new Set([...Object.keys(income), ...Object.keys(expense)]);
  
  return Array.from(months)
    .map(monthKey => {
      // Split YYYY-MM format
      const [year, month] = monthKey.split('-');
      const formattedMonth = `${month}/${year.slice(-2)}`; // Use MM/YY format for cleaner chart
      
      const incomeAmount = income[monthKey] || 0;
      const expenseAmount = expense[monthKey] || 0;
      
      return {
        month: formattedMonth,
        income: parseFloat(incomeAmount.toFixed(2)),
        expense: parseFloat(expenseAmount.toFixed(2)),
        savings: parseFloat((incomeAmount - expenseAmount).toFixed(2))
      };
    })
    .sort((a, b) => {
      // Parse month/year for proper chronological sorting
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      return new Date(`20${aYear}-${aMonth}-01`).getTime() - new Date(`20${bYear}-${bMonth}-01`).getTime();
    });
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border rounded-md shadow-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span>{entry.name}: {formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function InsightsDashboard() {
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [timeframe, setTimeframe] = useState('6');
  
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/insights?months=${timeframe}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch insights');
        }
        const data = await response.json();
        setInsightsData(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        toast.error('Failed to load insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, [timeframe]);
  
  // Use memoized values for chart data to avoid recalculations
  const categoryData = useMemo(() => 
    formatCategoryData(insightsData?.categorizedSpending), 
    [insightsData?.categorizedSpending]
  );
  
  const monthlyTrendData = useMemo(() => 
    formatMonthlyTrendData(insightsData?.monthlySpendingTrend), 
    [insightsData?.monthlySpendingTrend]
  );
  
  const incomeExpenseData = useMemo(() => 
    formatIncomeExpenseData(
      insightsData?.incomeVsExpense?.income,
      insightsData?.incomeVsExpense?.expense
    ), 
    [insightsData?.incomeVsExpense?.income, insightsData?.incomeVsExpense?.expense]
  );
  
  // Check if we have data to display
  const hasData = useMemo(() => 
    categoryData.length > 0 || monthlyTrendData.length > 0 || incomeExpenseData.length > 0,
    [categoryData, monthlyTrendData, incomeExpenseData]
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader size="lg" />
        <span className="ml-4 text-muted-foreground">Loading insights...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Insights</CardTitle>
            <Tabs defaultValue={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="3">3 Months</TabsTrigger>
                <TabsTrigger value="6">6 Months</TabsTrigger>
                <TabsTrigger value="12">12 Months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            Visualize and understand your financial patterns
          </CardDescription>
        </CardHeader>
      </Card>
      
      {!hasData ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p className="mb-2 text-lg">No financial data available for this period</p>
              <p>Add some transactions to see your financial insights</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Where your money is going</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={40} // Adding innerRadius for a donut chart
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      paddingAngle={2} // Add padding between slices for better visual
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>How your expenses change over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickFormatter={(value) => `${formatCurrency(value, 0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      fill={THEME_COLORS[0]} 
                      name="Spending"
                      radius={[4, 4, 0, 0]} // Rounded corners on top
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No monthly trend data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Your financial balance over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {incomeExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeExpenseData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#d1d5db' }}
                      tickFormatter={(value) => `${formatCurrency(value, 0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="income" 
                      fill={THEME_COLORS[1]} 
                      name="Income"
                      radius={[4, 4, 0, 0]} // Rounded corners on top
                    />
                    <Bar 
                      dataKey="expense" 
                      fill={THEME_COLORS[3]} 
                      name="Expense"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="savings" 
                      fill={THEME_COLORS[0]} 
                      name="Savings"
                      radius={[4, 4, 0, 0]}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No income/expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}