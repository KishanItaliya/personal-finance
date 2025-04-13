import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/ui/LogoutButton';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Financial Tracker</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/dashboard" 
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/transactions" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Transactions
                </Link>
                <Link 
                  href="/dashboard/accounts" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Accounts
                </Link>
                <Link 
                  href="/dashboard/categories" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Categories
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-4">
                    {session.user.name || session.user.email}
                  </span>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Account Overview</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your total balance: ${totalBalance?.toFixed(2)}
              </p>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {accounts?.map((account) => (
                  <div key={account.id} className="bg-gray-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {account.name}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        ${account.balance.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                  <p className="mt-1 text-sm text-gray-500">Your last 5 transactions</p>
                </div>
                <Link
                  href="/dashboard/transactions/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Transaction
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 font-medium text-xs text-gray-500 uppercase tracking-wider">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Category</div>
                  <div>Amount</div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <li key={transaction.id}>
                        <div className="px-4 py-4 sm:px-6 sm:grid sm:grid-cols-4 sm:gap-4">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction?.category?.name}
                          </div>
                          <div className={`text-sm font-medium ${
                            Number(transaction?.amount) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ${Math.abs(Number(transaction.amount)).toFixed(2)}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-5 sm:px-6 text-sm text-gray-500 text-center">
                      No transactions found. Add your first transaction to get started.
                    </li>
                  )}
                </ul>
              </div>
              {recentTransactions.length > 0 && (
                <div className="px-4 py-4 sm:px-6 text-right">
                  <Link
                    href="/dashboard/transactions"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all transactions <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Quick Analysis</h2>
                <p className="mt-1 text-sm text-gray-500">Financial health indicators</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Spending Trend</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {recentTransactions.length === 0 
                        ? "Not enough data" 
                        : "Your spending is stable compared to last month"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {recentTransactions.length === 0
                        ? "Not enough data"
                        : "Add your income to calculate savings rate"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
                <p className="mt-1 text-sm text-gray-500">Common actions to get started</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/dashboard/transactions/create"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Add a new transaction
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/accounts/create"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Create a new account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/categories"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Manage your categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/reports"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      View financial reports
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}