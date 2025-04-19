import React from 'react';
import AddTransactionForm from '@/components/forms/AddTransactionForm';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Create Transaction | Personal Finance Dashboard',
  description: 'Create a new financial transaction',
};

export default async function CreateTransactionPage() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Unauthorized access</p>
          <p className="mt-2">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch accounts and categories for the form
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Transaction</h1>
      </div>
      
      <div className="bg-white rounded-lg">
        <AddTransactionForm 
          accounts={accounts}
          categories={categories}
        />
      </div>
    </div>
  );
}
