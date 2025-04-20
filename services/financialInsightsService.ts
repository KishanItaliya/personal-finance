// services/financialInsightsService.ts

import { prisma } from '@/lib/prisma';
import { Transaction, Category, Account } from '@prisma/client';

// Define extended types with relations
type TransactionWithRelations = Transaction & {
  category: Category | null;
  account: Account | null;
};

export class FinancialInsightsService {
  async getUserTransactions(userId: string, months: number = 6): Promise<TransactionWithRelations[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate
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
  }
  
  async getCategorizedSpending(userId: string, months: number = 6): Promise<Record<string, number>> {
    const transactions = await this.getUserTransactions(userId, months);
    
    // Only include expense transactions
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    // Group by category and sum amounts
    return expenses.reduce((acc, transaction) => {
      // Safely access category name using optional chaining
      const categoryName = transaction.category?.name || 'Uncategorized';
      
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      
      // Convert Decimal to number using .toString() then parseFloat
      acc[categoryName] += parseFloat(transaction.amount.toString());
      return acc;
    }, {} as Record<string, number>);
  }
  
  async getMonthlySpendingTrend(userId: string, months: number = 6): Promise<Record<string, number>> {
    const transactions = await this.getUserTransactions(userId, months);
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    // Group by month and sum amounts
    const monthlySpending = expenses.reduce((acc, transaction) => {
      // Format date as YYYY-MM for consistent sorting
      const month = this.formatMonthKey(transaction.date);
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      
      acc[month] += parseFloat(transaction.amount.toString());
      return acc;
    }, {} as Record<string, number>);
    
    return monthlySpending;
  }
  
  async getIncomeVsExpense(userId: string, months: number = 6): Promise<{
    income: Record<string, number>,
    expense: Record<string, number>
  }> {
    const transactions = await this.getUserTransactions(userId, months);
    
    const result = {
      income: {} as Record<string, number>,
      expense: {} as Record<string, number>
    };
    
    transactions.forEach(transaction => {
      // Format date as YYYY-MM for consistent sorting
      const month = this.formatMonthKey(transaction.date);
      
      if (transaction.type === 'INCOME') {
        if (!result.income[month]) result.income[month] = 0;
        result.income[month] += parseFloat(transaction.amount.toString());
      } else if (transaction.type === 'EXPENSE') {
        if (!result.expense[month]) result.expense[month] = 0;
        result.expense[month] += parseFloat(transaction.amount.toString());
      }
    });
    
    return result;
  }
  
  // Helper method to ensure consistent month formatting
  private formatMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}