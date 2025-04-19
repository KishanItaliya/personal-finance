// app/dashboard/transactions/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TransactionList from '@/components/transactions/TransactionList';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { dashboardRoutes } from '@/lib/routes';
import { prisma } from '@/lib/prisma';
import { Category, Account } from '@prisma/client';

export default async function TransactionsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch unique categories and accounts for filters
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }) as Category[];

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  }) as Account[];
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button asChild>
          <Link href={dashboardRoutes.transactions.create}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Link>
        </Button>
      </div>
      
      <TransactionList categories={categories} accounts={accounts} />
    </>
  );
}