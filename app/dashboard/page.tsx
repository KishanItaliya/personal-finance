import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { dashboardRoutes, quickActionRoutes } from '@/lib/routes';
import { formatCurrency, isPositiveAmount } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  
  // Fetch account balances
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
    },
  });
  
  // Fetch recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 5,
  });
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Your total balance: {formatCurrency(totalBalance)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts?.map((account) => (
              <Card key={account.id} className="bg-accent/10">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    {account.name}
                  </div>
                  <div className="mt-1 text-2xl font-semibold">
                    {formatCurrency(Number(account.balance))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your last 5 transactions</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={dashboardRoutes.transactions.create}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const transactionAmount = Number(transaction.amount);
                  return (
                    <div key={transaction.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.description}</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{transaction?.category?.name}</span>
                        </div>
                      </div>
                      <span className={`font-medium ${
                        isPositiveAmount(transactionAmount)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(transactionAmount))}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-end mt-3 pt-2">
                  <Button variant="ghost" asChild size="sm">
                    <Link href={dashboardRoutes.transactions.index} className="flex items-center">
                      View all
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No transactions found. Add your first transaction to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {quickActionRoutes.map((action) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={action.path}
                    asChild 
                    variant="outline" 
                    className="justify-start"
                  >
                    <Link href={action.path}>
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}