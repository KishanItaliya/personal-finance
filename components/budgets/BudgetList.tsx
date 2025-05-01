'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
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
  Filter, 
  MoreHorizontal,
  Search, 
  Pencil,
  Trash2,
  PieChart,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { dashboardRoutes } from '@/lib/routes';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader } from "@/components/ui/loader";
import { format } from 'date-fns';
import { Progress } from "@/components/ui/progress";

// Define Budget Period enum
enum BudgetPeriodEnum {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  plannedAmount: string;
  actualAmount: string;
  category: {
    id: string;
    name: string;
  };
}

interface Budget {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  totalAmount: string;
  period: BudgetPeriodEnum;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  budgetCategories: BudgetCategory[];
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface BudgetsResponse {
  budgets: Budget[];
  pagination: PaginationInfo;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

// Helper to format dates
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

// Helper to format budget period
function formatPeriod(period: BudgetPeriodEnum): string {
  switch (period) {
    case BudgetPeriodEnum.WEEKLY:
      return 'Weekly';
    case BudgetPeriodEnum.MONTHLY:
      return 'Monthly';
    case BudgetPeriodEnum.YEARLY:
      return 'Yearly';
    default:
      return period;
  }
}

// Helper to calculate budget progress
function calculateBudgetProgress(budget: Budget): number {
  const totalPlanned = parseFloat(budget.totalAmount);
  const totalActual = budget.budgetCategories.reduce(
    (sum, category) => sum + parseFloat(category.actualAmount), 
    0
  );
  
  return Math.min(Math.round((totalActual / totalPlanned) * 100), 100);
}

export default function BudgetList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get current URL search params
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const sortField = searchParams.get('sortField') || 'startDate';
  const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
  const searchTerm = searchParams.get('search') || '';
  const filterPeriod = searchParams.get('period') || '';
  const filterActive = searchParams.get('isActive') || '';

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

  // Fetch budgets using React Query
  const { data, isLoading, isError, error } = useQuery<BudgetsResponse>({
    queryKey: ['budgets', page, pageSize, sortField, sortDirection, searchTerm, filterPeriod, filterActive],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortDirection,
      });
      
      if (searchTerm) params.set('search', searchTerm);
      if (filterPeriod) params.set('period', filterPeriod);
      if (filterActive) params.set('isActive', filterActive);
      
      // Fetch data from API
      const response = await fetch(`/api/budgets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      return response.json();
    },
  });

  // Handlers for sorting, filtering, and pagination
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    updateParams({ sortField: field, sortDirection: newDirection });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
      sortField: 'startDate',
      sortDirection: 'desc',
      search: null,
      period: null,
      isActive: null,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center space-x-2 sm:w-auto">
            <Input
              placeholder="Search budgets..."
              className="w-full sm:w-[300px]"
              onChange={handleSearch}
              defaultValue={searchTerm}
              type="search"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filterPeriod}
              onValueChange={(value) => updateParams({ period: value || null })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allPeriods">All Periods</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filterActive}
              onValueChange={(value) => updateParams({ isActive: value || null })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allStatuses">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-md bg-destructive/15 p-4 text-center">
            <p className="text-sm text-destructive">
              Error: {error instanceof Error ? error.message : 'Failed to load budgets'}
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => router.refresh()}
            >
              Try Again
            </Button>
          </div>
        ) : !data || data.budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <PieChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No budgets found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You haven&apos;t created any budgets yet or none match your filters.
            </p>
            <Button asChild>
              <Link href={dashboardRoutes.budgets.create}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Budget
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('name')}
                      >
                        Budget Name
                        <ArrowUpDown 
                          className={`ml-2 h-4 w-4 ${sortField === 'name' ? 'opacity-100' : 'opacity-40'}`} 
                        />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('period')}
                      >
                        Period
                        <ArrowUpDown 
                          className={`ml-2 h-4 w-4 ${sortField === 'period' ? 'opacity-100' : 'opacity-40'}`} 
                        />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('startDate')}
                      >
                        Date Range
                        <ArrowUpDown 
                          className={`ml-2 h-4 w-4 ${sortField === 'startDate' ? 'opacity-100' : 'opacity-40'}`} 
                        />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        className="p-0 font-medium"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Budget Amount
                        <ArrowUpDown 
                          className={`ml-2 h-4 w-4 ${sortField === 'totalAmount' ? 'opacity-100' : 'opacity-40'}`} 
                        />
                      </Button>
                    </TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.budgets.map((budget) => {
                    const progress = calculateBudgetProgress(budget);
                    
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/dashboard/budgets/${budget.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {budget.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatPeriod(budget.period as BudgetPeriodEnum)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(parseFloat(budget.totalAmount))}</TableCell>
                        <TableCell>
                          <div className="w-full max-w-[200px]">
                            <div className="flex items-center justify-between mb-1 text-xs">
                              <span>{progress}% Used</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {budget.isActive ? (
                            <Badge className="flex items-center bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center">
                              <XCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/budgets/${budget.id}`}>
                                  <PieChart className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/budgets/edit/${budget.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Budget
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Budget
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {data.pagination.totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                    />
                  </PaginationItem>
                  
                  {getPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(data.pagination.totalPages, page + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 