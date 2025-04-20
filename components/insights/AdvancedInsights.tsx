"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

// Define types for advanced insights data
interface RecurringPattern {
  payee: string;
  categoryId: string;
  averageAmount: number;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'irregular';
  confidenceScore: number;
  lastTransactionDate: string;
  nextPredictedDate: string | null;
}

interface AnomalyDetection {
  transaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
    payee: string;
  };
  reason: string;
  severity: 'low' | 'medium' | 'high';
  amountDeviation?: number;
  timeDeviation?: number;
}

interface MonthlyForecast {
  month: string;
  predictedIncome: number;
  predictedExpenses: number;
  predictedSavings: number;
  confidenceScore: number;
}

interface CategoryForecast {
  categoryId: string;
  categoryName: string;
  currentMonthPrediction: number;
  nextMonthPrediction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidenceScore: number;
}

interface AdvancedInsightsData {
  recurringPatterns: RecurringPattern[];
  anomalies: AnomalyDetection[];
  monthlyForecasts: MonthlyForecast[];
  categoryForecasts: CategoryForecast[];
  insights: string[];
}

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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

// Custom tooltip component for improved readability
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

export default function AdvancedInsights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdvancedInsightsData | null>(null);
  const [timeframe, setTimeframe] = useState('12');
  const [activeTab, setActiveTab] = useState('patterns');
  
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/insights/advanced?months=${timeframe}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch advanced insights');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching advanced insights:', error);
        toast.error('Failed to load advanced insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, [timeframe]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader size="lg" />
        <span className="ml-4 text-muted-foreground">Loading advanced insights...</span>
      </div>
    );
  }
  
  if (!data) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            <p className="mb-2 text-lg">No advanced insights available</p>
            <p>Add more transactions to enable pattern detection and forecasting</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Financial Insights</CardTitle>
            <Tabs defaultValue={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="6">6 Months</TabsTrigger>
                <TabsTrigger value="12">12 Months</TabsTrigger>
                <TabsTrigger value="24">24 Months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            Deeper analysis of your financial patterns, anomalies and predictions
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Natural Language Insights */}
      {data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'patterns' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('patterns')}
        >
          Recurring Patterns
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'anomalies' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('anomalies')}
        >
          Anomalies
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'forecasts' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('forecasts')}
        >
          Forecasts
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {/* Recurring Patterns */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Transactions</CardTitle>
                <CardDescription>Detected subscription and regular payment patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recurringPatterns.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No recurring patterns detected yet. Add more transactions to improve pattern detection.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recurringPatterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{pattern.payee}</h3>
                            <Badge variant={pattern.frequency === 'monthly' ? 'default' : 
                                           pattern.frequency === 'weekly' ? 'outline' : 'secondary'}>
                              {pattern.frequency.charAt(0).toUpperCase() + pattern.frequency.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10">
                              {Math.round(pattern.confidenceScore * 100)}% confident
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            Average: {formatCurrency(pattern.averageAmount)}
                          </p>
                          {pattern.nextPredictedDate && (
                            <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Next expected: {new Date(pattern.nextPredictedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unusual Transactions</CardTitle>
                <CardDescription>Detected anomalies in your spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {data.anomalies.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No anomalies detected in your transactions.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.anomalies.map((anomaly, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-5 w-5 ${
                                anomaly.severity === 'high' ? 'text-destructive' : 
                                anomaly.severity === 'medium' ? 'text-amber-500' : 
                                'text-muted-foreground'
                              }`} />
                              <h3 className="font-medium">{anomaly.transaction.payee}</h3>
                              <Badge variant={
                                anomaly.severity === 'high' ? 'destructive' : 
                                anomaly.severity === 'medium' ? 'outline' : 
                                'secondary'
                              }>
                                {anomaly.severity} severity
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {formatCurrency(anomaly.transaction.amount)} on {new Date(anomaly.transaction.date).toLocaleDateString()}
                            </p>
                            <p className="mt-2">{anomaly.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Forecasts */}
        {activeTab === 'forecasts' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Forecasts</CardTitle>
                <CardDescription>Predicted income, expenses and savings for upcoming months</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {data.monthlyForecasts.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    Not enough data to generate forecasts. Add more transactions to improve prediction.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.monthlyForecasts.map(f => ({
                        ...f,
                        month: f.month.substring(5) + '/' + f.month.substring(0, 4)
                      }))}
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
                      <Bar dataKey="predictedIncome" name="Income" fill={THEME_COLORS[1]} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predictedExpenses" name="Expenses" fill={THEME_COLORS[3]} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predictedSavings" name="Savings" fill={THEME_COLORS[0]} radius={[4, 4, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Forecasts</CardTitle>
                <CardDescription>Predicted spending by category for the next month</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {data.categoryForecasts.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    Not enough data to generate category forecasts.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categoryForecasts
                        .sort((a, b) => b.nextMonthPrediction - a.nextMonthPrediction)
                        .slice(0, 10)
                        .map(cf => ({
                          name: cf.categoryName,
                          current: cf.currentMonthPrediction,
                          next: cf.nextMonthPrediction,
                          trend: cf.trend,
                          confidence: Math.round(cf.confidenceScore * 100)
                        }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `${formatCurrency(value, 0)}`}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="current" name="Current Month" fill={THEME_COLORS[5]} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="next" name="Next Month" fill={THEME_COLORS[0]} radius={[0, 4, 4, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 