import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { dashboardRoutes } from '@/lib/routes';
import BudgetList from '@/components/budgets/BudgetList';

export default async function BudgetsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button asChild>
          <Link href={dashboardRoutes.budgets.create}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Link>
        </Button>
      </div>
      
      <BudgetList />
    </>
  );
} 