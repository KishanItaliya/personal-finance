import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma, BudgetPeriod } from '@prisma/client';

// GET a single budget by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const budgetId = params.id;
    
    // Fetch the budget with related data
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
        userId, // Ensure the budget belongs to the authenticated user
      },
      include: {
        budgetCategories: {
          include: {
            category: true,
          },
        },
      },
    });
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    // Serialize the budget to handle Decimal objects
    const serializedBudget = {
      ...budget,
      totalAmount: budget.totalAmount.toString(),
      budgetCategories: budget.budgetCategories.map(bc => ({
        ...bc,
        plannedAmount: bc.plannedAmount.toString(),
        actualAmount: bc.actualAmount.toString(),
      })),
    };
    
    return NextResponse.json(serializedBudget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// PATCH to update a budget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const budgetId = params.id;
    const body = await request.json();
    
    // Check if the budget exists and belongs to the user
    const existingBudget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
        userId,
      },
    });
    
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    const { name, startDate, endDate, totalAmount, period, isActive, budgetCategories } = body;
    
    // Update the budget in a transaction
    const updatedBudget = await prisma.$transaction(async (tx) => {
      // Update the budget
      const budget = await tx.budget.update({
        where: { id: budgetId },
        data: {
          name,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          totalAmount: totalAmount ? new Prisma.Decimal(totalAmount) : undefined,
          period: period as BudgetPeriod | undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        },
      });
      
      // Update budget categories if provided
      if (budgetCategories && Array.isArray(budgetCategories)) {
        // Delete existing categories
        await tx.budgetCategory.deleteMany({
          where: { budgetId },
        });
        
        // Create new categories
        const budgetCategoryPromises = budgetCategories.map((category: { 
          categoryId: string; 
          plannedAmount: string;
          actualAmount?: string; 
        }) => {
          return tx.budgetCategory.create({
            data: {
              budgetId,
              categoryId: category.categoryId,
              plannedAmount: new Prisma.Decimal(category.plannedAmount),
              actualAmount: category.actualAmount 
                ? new Prisma.Decimal(category.actualAmount) 
                : new Prisma.Decimal(0),
            },
          });
        });
        
        await Promise.all(budgetCategoryPromises);
      }
      
      return budget;
    });
    
    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const budgetId = params.id;
    
    // Check if the budget exists and belongs to the user
    const existingBudget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
        userId,
      },
    });
    
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    // Delete the budget (cascade will handle budget categories)
    await prisma.budget.delete({
      where: { id: budgetId },
    });
    
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
} 