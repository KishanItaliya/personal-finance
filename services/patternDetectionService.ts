import { Transaction } from '@prisma/client';

export interface TransactionWithPayee extends Transaction {
  payee: string;
}

export interface RecurringPattern {
  payee: string;
  categoryId: string;
  averageAmount: number;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'irregular';
  confidenceScore: number;
  lastTransactionDate: Date;
  nextPredictedDate: Date | null;
  transactions: TransactionWithPayee[];
}

export interface AnomalyDetection {
  transaction: TransactionWithPayee;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  amountDeviation?: number;
  timeDeviation?: number;
}

export class PatternDetectionService {
  // Detect recurring transactions like subscriptions or bills
  detectRecurringTransactions(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    
    // Ensure transactions have payee (using description as fallback)
    const txsWithPayee = transactions.map(tx => ({
      ...tx,
      payee: tx.description // Use description as payee if not available
    })) as TransactionWithPayee[];
    
    // Group transactions by payee and category
    const grouped = txsWithPayee.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || 'uncategorized';
      const key = `${transaction.payee}-${categoryId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(transaction);
      return acc;
    }, {} as Record<string, TransactionWithPayee[]>);
    
    // Analyze each group for patterns
    for (const [key, txs] of Object.entries(grouped)) {
      if (txs.length < 2) continue; // Need at least 2 transactions to find a pattern
      
      // Sort by date
      const sortedTxs = [...txs].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate average amount
      const total = sortedTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const averageAmount = total / sortedTxs.length;
      
      // Calculate time intervals between transactions
      const intervals: number[] = [];
      for (let i = 1; i < sortedTxs.length; i++) {
        const daysDiff = Math.floor(
          (sortedTxs[i].date.getTime() - sortedTxs[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
        );
        intervals.push(daysDiff);
      }
      
      // Determine frequency
      let frequency: RecurringPattern['frequency'] = 'irregular';
      let confidenceScore = 0;
      let nextPredictedDate: Date | null = null;
      
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const stdDev = Math.sqrt(
          intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
        );
        
        // If standard deviation is less than 3 days, it's likely regular
        const isRegular = stdDev < 3;
        
        if (isRegular) {
          if (avgInterval >= 25 && avgInterval <= 35) {
            frequency = 'monthly';
            confidenceScore = 0.9 - stdDev / 30; // Higher std dev means lower confidence
          } else if (avgInterval >= 5 && avgInterval <= 9) {
            frequency = 'weekly';
            confidenceScore = 0.9 - stdDev / 7;
          } else if (avgInterval >= 350 && avgInterval <= 380) {
            frequency = 'yearly';
            confidenceScore = 0.9 - stdDev / 365;
          } else {
            confidenceScore = 0.5 - stdDev / 30;
          }
          
          // Predict next date based on frequency and last transaction date
          const lastTxDate = new Date(sortedTxs[sortedTxs.length - 1].date);
          nextPredictedDate = new Date(lastTxDate);
          
          if (frequency === 'monthly') {
            nextPredictedDate.setMonth(nextPredictedDate.getMonth() + 1);
          } else if (frequency === 'weekly') {
            nextPredictedDate.setDate(nextPredictedDate.getDate() + 7);
          } else if (frequency === 'yearly') {
            nextPredictedDate.setFullYear(nextPredictedDate.getFullYear() + 1);
          } else {
            nextPredictedDate.setDate(nextPredictedDate.getDate() + Math.round(avgInterval));
          }
        }
      }
      
      // Add to patterns if confidence is high enough
      if (confidenceScore > 0.6) {
        const [payee, categoryId] = key.split('-');
        patterns.push({
          payee,
          categoryId,
          averageAmount,
          frequency,
          confidenceScore,
          lastTransactionDate: sortedTxs[sortedTxs.length - 1].date,
          nextPredictedDate,
          transactions: sortedTxs
        });
      }
    }
    
    return patterns;
  }
  
  // Detect anomalies in transactions
  detectAnomalies(transactions: Transaction[], patterns: RecurringPattern[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Ensure transactions have payee (using description as fallback)
    const txsWithPayee = transactions.map(tx => ({
      ...tx,
      payee: tx.description // Use description as payee if not available
    })) as TransactionWithPayee[];
    
    // Group transactions by category for category-based anomaly detection
    const txByCategory = txsWithPayee.reduce((acc, tx) => {
      const categoryId = tx.categoryId || 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(tx);
      return acc;
    }, {} as Record<string, TransactionWithPayee[]>);
    
    // Check for anomalies in each category
    for (const [, categoryTxs] of Object.entries(txByCategory)) {
      if (categoryTxs.length < 5) continue; // Need sufficient data for meaningful analysis
      
      // Calculate mean and standard deviation for amounts in this category
      const amounts = categoryTxs.map(tx => Number(tx.amount));
      const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length
      );
      
      // Check each transaction for unusual amounts (beyond 2 standard deviations)
      categoryTxs.forEach(tx => {
        const txAmount = Number(tx.amount);
        const deviation = Math.abs(txAmount - mean);
        const deviationScore = deviation / stdDev;
        
        if (deviationScore > 2) {
          let severity: AnomalyDetection['severity'] = 'low';
          if (deviationScore > 3) severity = 'medium';
          if (deviationScore > 4) severity = 'high';
          
          anomalies.push({
            transaction: tx,
            reason: `Unusual amount for ${tx.payee} in this category`,
            severity,
            amountDeviation: deviationScore
          });
        }
      });
    }
    
    // Check for anomalies in recurring patterns
    patterns.forEach(pattern => {
      const recentTxs = pattern.transactions
        .slice(-3) // Look at latest 3 transactions in the pattern
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      if (recentTxs.length > 0) {
        const latestTx = recentTxs[0];
        const txAmount = Number(latestTx.amount);
        
        // Check if amount deviates significantly from pattern average
        const amountDeviation = Math.abs(txAmount - pattern.averageAmount) / pattern.averageAmount;
        
        if (amountDeviation > 0.2) { // 20% deviation
          let severity: AnomalyDetection['severity'] = 'low';
          if (amountDeviation > 0.5) severity = 'medium';
          if (amountDeviation > 1) severity = 'high';
          
          anomalies.push({
            transaction: latestTx,
            reason: `Unusual amount for recurring ${pattern.payee} payment`,
            severity,
            amountDeviation
          });
        }
        
        // Check for timing anomalies in patterns with high confidence
        if (pattern.confidenceScore > 0.8 && recentTxs.length > 1) {
          const latestInterval = Math.floor(
            (recentTxs[0].date.getTime() - recentTxs[1].date.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          let expectedInterval = 30; // Default to monthly
          if (pattern.frequency === 'weekly') expectedInterval = 7;
          if (pattern.frequency === 'yearly') expectedInterval = 365;
          
          const timeDeviation = Math.abs(latestInterval - expectedInterval) / expectedInterval;
          
          if (timeDeviation > 0.2) { // 20% deviation in timing
            let severity: AnomalyDetection['severity'] = 'low';
            if (timeDeviation > 0.4) severity = 'medium';
            if (timeDeviation > 0.6) severity = 'high';
            
            anomalies.push({
              transaction: latestTx,
              reason: `Unusual timing for recurring ${pattern.payee} payment`,
              severity,
              timeDeviation
            });
          }
        }
      }
    });
    
    return anomalies;
  }
}