'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, PiggyBank, CreditCard, BriefcaseBusiness, DollarSign, Plus, MoreVertical, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { dashboardRoutes } from '@/lib/routes';
import { formatCurrency } from '@/lib/utils';

// Define the Account type based on the Prisma schema
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution: string | null;
  isActive: boolean;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/accounts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/accounts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Remove account from state
      setAccounts(accounts.filter(account => account.id !== id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  // Get icon based on account type
  const getAccountIcon = (type: string) => {
    switch(type) {
      case 'CHECKING':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'SAVINGS':
        return <PiggyBank className="h-5 w-5 text-teal-500" />;
      case 'CREDIT':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'INVESTMENT':
        return <BriefcaseBusiness className="h-5 w-5 text-amber-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get formatted account type
  const getAccountType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-[70vh]">
        <Loader size="lg" center />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button asChild>
          <Link href={dashboardRoutes.accounts.create}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Link>
        </Button>
      </div>

      <Card className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-muted-foreground">Total Balance</CardTitle>
          <CardDescription className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            Manage your financial accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="group hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full p-1.5 bg-muted">
                            {getAccountIcon(account.type)}
                          </div>
                          <span>{account.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getAccountType(account.type)}</TableCell>
                      <TableCell>{account.institution || '—'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(account.balance))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={dashboardRoutes.accounts.edit(account.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-500"
                              onClick={() => {
                                setAccountToDelete(account.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center mb-2">
                <CreditCard className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="mb-2">No accounts found</p>
              <p className="text-sm text-muted-foreground">
                Add your first account to start tracking your finances
              </p>
              <Button className="mt-4" asChild>
                <Link href={dashboardRoutes.accounts.create}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              <br/><br/>
              <span className="font-semibold">Warning:</span> Deleting an account will also remove all associated transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => accountToDelete && deleteAccount(accountToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 