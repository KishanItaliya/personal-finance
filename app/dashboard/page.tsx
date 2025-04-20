import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, PiggyBank, Wallet, BriefcaseBusiness, DollarSign, Plus } from "lucide-react";
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
  
  // Get account type icon
  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'CHECKING':
        return <Wallet className="h-10 w-10 bg-blue-100 text-blue-500 rounded-full p-2" />;
      case 'SAVINGS':
        return <PiggyBank className="h-10 w-10 bg-teal-100 text-teal-500 rounded-full p-2" />;
      case 'CREDIT':
        return <CreditCard className="h-10 w-10 bg-purple-100 text-purple-500 rounded-full p-2" />;
      case 'INVESTMENT':
        return <BriefcaseBusiness className="h-10 w-10 bg-amber-100 text-amber-500 rounded-full p-2" />;
      default:
        return <DollarSign className="h-10 w-10 bg-gray-100 text-gray-500 rounded-full p-2" />;
    }
  };
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-6 overflow-hidden gap-4 bg-linear-to-r from-gray-300 via-gray-400 to-gray-500">
        <div className="p-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">Total Balance</h3>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
            </div>
            <Button asChild className="mt-4 md:mt-0" variant="outline">
              <Link href={dashboardRoutes.accounts.create}>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Link>
            </Button>
          </div>
        </div>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accounts?.map((account) => (
              <Card key={account.id} className="overflow-hidden shadow-lg py-2">
                <CardContent className="p-0">
                  <div className="flex items-start p-4">
                    <div className="mr-4">
                      {getAccountIcon(account.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {account.name}
                      </h4>
                      <p className="mt-1 text-xl font-semibold">
                        {formatCurrency(Number(account.balance))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        {/* <CardFooter className="bg-muted/50 py-3 flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={dashboardRoutes.accounts.index} className="flex items-center text-sm text-muted-foreground">
              View all accounts
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </CardFooter> */}
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
                <Plus className="mr-2 h-4 w-4" />
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