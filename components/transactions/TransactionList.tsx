'use client';

import React from 'react';
import { formatCurrency, isPositiveAmount } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowUpDown, 
  CalendarIcon, 
  CreditCard, 
  Filter, 
  MoreHorizontal,
  Search, 
  Tag, 
  Trash2,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { dashboardRoutes } from '@/lib/routes';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Category, Account } from '@prisma/client';
import { Loader } from "@/components/ui/loader";

// Define Transaction Type enum since we're not importing it from Prisma to avoid name conflict
enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

interface Transaction {
  id: string;
  description: string;
  amount: string;
  date: string | Date;
  type: TransactionTypeEnum;
  notes?: string | null;
  categoryId?: string | null;
  accountId?: string | null;
  receiptUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userId?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

// Add formatDate function locally to avoid lib/utils import issues
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function TransactionList({ categories, accounts }: { categories: Category[], accounts: Account[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get current URL search params
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const sortField = searchParams.get('sortField') || 'date';
  const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
  const searchTerm = searchParams.get('search') || '';
  const filterType = searchParams.get('type') || '';
  const filterAccount = searchParams.get('accountId') || '';
  const filterCategory = searchParams.get('categoryId') || '';

  // Function to update URL params and trigger query refetch
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    // Update params
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 if filters change
    if (!('page' in updates)) {
      params.set('page', '1');
    }
    
    // Build the new URL with updated params
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  // Fetch transactions using React Query
  const { data, isLoading, isError, error } = useQuery<TransactionsResponse>({
    queryKey: ['transactions', page, pageSize, sortField, sortDirection, searchTerm, filterType, filterAccount, filterCategory],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortDirection,
      });
      
      if (searchTerm) params.set('search', searchTerm);
      if (filterType) params.set('type', filterType);
      if (filterAccount) params.set('accountId', filterAccount);
      if (filterCategory) params.set('categoryId', filterCategory);
      
      // Fetch data from API
      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      return response.json();
    },
  });

  // Handlers for sorting, filtering, and pagination
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    updateParams({ sortField: field, sortDirection: newDirection });
  };

  const handleSearch = (value: string) => {
    // Debounce search input
    const timeoutId = setTimeout(() => {
      updateParams({ search: value || null });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleResetFilters = () => {
    updateParams({
      page: '1',
      sortField: 'date',
      sortDirection: 'desc',
      search: null,
      type: null,
      accountId: null,
      categoryId: null,
    });
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items: React.ReactNode[] = [];
    
    if (!data?.pagination) return items;
    
    const { totalPages, page: currentPage } = data.pagination;
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're handled separately
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader size="lg" />
        <span className="ml-4 text-muted-foreground">Loading transactions...</span>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 font-medium mb-2">Error loading transactions</p>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          <Button className="mt-4" onClick={() => router.refresh()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  // Extract data from the query result
  const { transactions, pagination } = data || { 
    transactions: [], 
    pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 1, hasMore: false },
  };

  // Transaction type options for dropdown
  const transactionTypes = [
    { value: 'INCOME', label: 'Income' },
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'TRANSFER', label: 'Transfer' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {pagination.totalCount} transaction{pagination.totalCount !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                defaultValue={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" asChild>
              <Link href={dashboardRoutes.transactions.create}>
                <Filter className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select value={filterType} onValueChange={(value) => updateParams({ type: value || null })}>
            <SelectTrigger className="w-auto min-w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTypes">All Types</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterAccount} onValueChange={(value) => updateParams({ accountId: value || null })}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allAccounts">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={(value) => updateParams({ categoryId: value || null })}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allCategories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterType || filterAccount || filterCategory || searchTerm || sortField !== 'date' || sortDirection !== 'desc') && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="ml-auto">
              Reset Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 font-medium"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Date
                    <ArrowUpDown className={`h-3 w-3 ${sortField === 'date' ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </TableHead>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Description
                    <ArrowUpDown className={`h-3 w-3 ${sortField === 'description' ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Amount
                    <ArrowUpDown className={`h-3 w-3 ${sortField === 'amount' ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 font-medium"
                  >
                    <Tag className="h-4 w-4" />
                    Category
                    <ArrowUpDown className={`h-3 w-3 ${sortField === 'category' ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('account')}
                    className="flex items-center gap-1 font-medium"
                  >
                    <CreditCard className="h-4 w-4" />
                    Account
                    <ArrowUpDown className={`h-3 w-3 ${sortField === 'account' ? 'opacity-100' : 'opacity-40'}`} />
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`font-medium ${isPositiveAmount(transaction.amount) ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                          {transaction.category.icon && (
                            <span>{transaction.category.icon}</span>
                          )}
                          {transaction.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.account ? (
                        transaction.account.name
                      ) : (
                        <span className="text-muted-foreground text-sm">Unknown account</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`${dashboardRoutes.transactions.index}/${transaction.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination.totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  aria-disabled={pagination.page === 1}
                  tabIndex={pagination.page === 1 ? -1 : 0}
                  className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {getPaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  aria-disabled={pagination.page === pagination.totalPages}
                  tabIndex={pagination.page === pagination.totalPages ? -1 : 0}
                  className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}