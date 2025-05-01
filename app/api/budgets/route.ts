import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma, BudgetPeriod } from '@prisma/client';

// Helper function to parse pagination parameters
const parsePaginationParams = (params: URLSearchParams) => {
  const page = parseInt(params.get('page') || '1', 10);
  const pageSize = parseInt(params.get('pageSize') || '10', 10);
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    pageSize: isNaN(pageSize) ? 10 : Math.min(Math.max(1, pageSize), 100)
  };
};

// Helper function to parse sorting parameters
const parseSortParams = (params: URLSearchParams) => {
  const sortField = params.get('sortField') || 'startDate';
  const sortDirection = params.get('sortDirection') || 'desc';
  
  // Validate sort fields against a whitelist
  const validSortFields = ['name', 'startDate', 'endDate', 'totalAmount', 'period'];
  const field = validSortFields.includes(sortField) ? sortField : 'startDate';
  
  // Validate sort direction
  const direction = (sortDirection === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  
  return { field, direction };
};

// Helper function to build the where clause for filtering
const buildWhereClause = (params: URLSearchParams, userId: string) => {
  const where: Prisma.BudgetWhereInput = { userId };
  
  // Filter by active status
  const isActive = params.get('isActive');
  if (isActive === 'true' || isActive === 'false') {
    where.isActive = isActive === 'true';
  }
  
  // Filter by period
  const period = params.get('period');
  if (period && Object.values(BudgetPeriod).includes(period as BudgetPeriod)) {
    where.period = period as BudgetPeriod;
  }
  
  // Filter by search term (on name)
  const search = params.get('search');
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  
  // Filter by date range
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  
  if (startDate) {
    where.startDate = { gte: new Date(startDate) };
  }
  
  if (endDate) {
    where.endDate = { lte: new Date(endDate) };
  }
  
  return where;
};

// Helper function to build the orderBy clause for sorting
const buildOrderByClause = (sortField: string, sortDirection: 'asc' | 'desc') => {
  const direction = sortDirection;
  
  // Map sort fields to Prisma orderBy clauses
  switch (sortField) {
    case 'name':
      return { name: direction };
    case 'startDate':
      return { startDate: direction };
    case 'endDate':
      return { endDate: direction };
    case 'totalAmount':
      return { totalAmount: direction };
    case 'period':
      return { period: direction };
    default:
      return { startDate: 'desc' as const };
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get the session and ensure user is authenticated
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const { page, pageSize } = parsePaginationParams(searchParams);
    
    // Parse sorting parameters
    const { field: sortField, direction: sortDirection } = parseSortParams(searchParams);
    
    // Build the where clause for filtering
    const where = buildWhereClause(searchParams, userId);
    
    // Get the total count of budgets with these filters
    const totalCount = await prisma.budget.count({ where });
    
    // Build the orderBy clause for sorting
    const orderBy = buildOrderByClause(sortField, sortDirection);
    
    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Fetch the budgets with pagination, filtering, and sorting
    const budgets = await prisma.budget.findMany({
      where,
      include: {
        budgetCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    });
    
    // Serialize the budgets to handle Decimal objects
    const serializedBudgets = budgets.map(budget => ({
      ...budget,
      totalAmount: budget.totalAmount.toString(),
      budgetCategories: budget.budgetCategories.map(bc => ({
        ...bc,
        plannedAmount: bc.plannedAmount.toString(),
        actualAmount: bc.actualAmount.toString(),
      })),
    }));
    
    // Return the budgets with pagination info
    return NextResponse.json({
      budgets: serializedBudgets,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: page * pageSize < totalCount,
      },
      sortField,
      sortDirection,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { name, startDate, endDate, totalAmount, period, budgetCategories } = body;
    
    // Create budget with categories in a transaction
    const budget = await prisma.$transaction(async (tx) => {
      // Create the budget
      const newBudget = await tx.budget.create({
        data: {
          userId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalAmount: new Prisma.Decimal(totalAmount),
          period: period as BudgetPeriod,
          isActive: true,
        },
      });
      
      // Create budget categories
      const budgetCategoryPromises = budgetCategories.map((category: { categoryId: string; plannedAmount: string }) => {
        return tx.budgetCategory.create({
          data: {
            budgetId: newBudget.id,
            categoryId: category.categoryId,
            plannedAmount: new Prisma.Decimal(category.plannedAmount),
            actualAmount: new Prisma.Decimal(0), // Initialize with 0
          },
        });
      });
      
      await Promise.all(budgetCategoryPromises);
      
      return newBudget;
    });
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 