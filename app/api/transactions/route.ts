import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma, TransactionType } from '@prisma/client';

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
  const sortField = params.get('sortField') || 'date';
  const sortDirection = params.get('sortDirection') || 'desc';
  
  // Validate sort fields against a whitelist
  const validSortFields = ['date', 'amount', 'description', 'category', 'account', 'type'];
  const field = validSortFields.includes(sortField) ? sortField : 'date';
  
  // Validate sort direction
  const direction = (sortDirection === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  
  return { field, direction };
};

// Helper function to build the where clause for filtering
const buildWhereClause = (params: URLSearchParams, userId: string) => {
  const where: Prisma.TransactionWhereInput = { userId };
  
  // Filter by account
  const accountId = params.get('accountId');
  if (accountId) where.accountId = accountId;
  
  // Filter by category
  const categoryId = params.get('categoryId');
  if (categoryId) where.categoryId = categoryId;
  
  // Filter by transaction type
  const type = params.get('type');
  if (type && Object.values(TransactionType).includes(type as TransactionType)) {
    where.type = type as TransactionType;
  }
  
  // Filter by search term (on description, account name, or category name)
  const search = params.get('search');
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { account: { name: { contains: search, mode: 'insensitive' } } },
      { category: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }
  
  // Filter by date range
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');
  
  if (startDate || endDate) {
    where.date = {};
    
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }
  
  return where;
};

// Helper function to build the orderBy clause for sorting
const buildOrderByClause = (sortField: string, sortDirection: 'asc' | 'desc') => {
  const direction = sortDirection;
  
  // Map sort fields to Prisma orderBy clauses
  switch (sortField) {
    case 'date':
      return { date: direction };
    case 'amount':
      return { amount: direction };
    case 'description':
      return { description: direction };
    case 'category':
      return { category: { name: direction } };
    case 'account':
      return { account: { name: direction } };
    case 'type':
      return { type: direction };
    default:
      return { date: 'desc' as const };
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
    
    // Get the total count of transactions with these filters
    const totalCount = await prisma.transaction.count({ where });
    
    // Build the orderBy clause for sorting
    const orderBy = buildOrderByClause(sortField, sortDirection);
    
    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Fetch the transactions with pagination, filtering, and sorting
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy,
      skip,
      take: pageSize,
    });
    
    // Serialize the transactions to handle Decimal objects
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toString(),
      // Serialize Decimal values in nested objects
      account: transaction.account 
        ? {
            ...transaction.account,
            balance: transaction.account.balance?.toString(),
            interestRate: transaction.account.interestRate?.toString(),
            creditLimit: transaction.account.creditLimit?.toString(),
          } 
        : null,
    }));
    
    // Return the transactions with pagination info
    return NextResponse.json({
      transactions: serializedTransactions,
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
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
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
    const { accountId, categoryId, amount, date, description, type, merchant } = body;
    
    // Create transaction with properly typed data
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        amount: new Prisma.Decimal(amount),
        date: new Date(date),
        description,
        type: type as TransactionType,
        merchant,
      },
    });
    
    // Update account balance
    if (type === 'INCOME') {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: new Prisma.Decimal(amount),
          },
        },
      });
    } else if (type === 'EXPENSE') {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: new Prisma.Decimal(amount),
          },
        },
      });
    }
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}