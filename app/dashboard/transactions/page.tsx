// app/dashboard/transactions/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TransactionList from '@/components/transactions/TransactionList';

export default async function TransactionsPage({
  searchParams
}: {
  searchParams: { accountId?: string; categoryId?: string; type?: string }
}) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  const { accountId, categoryId, type } = searchParams;
  
  // Build the where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };
  
  if (accountId) where.accountId = accountId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  
  // Get transactions
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <TransactionList transactions={transactions} />
    </div>
  );
}