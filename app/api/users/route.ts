import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod'; // You'll need to install this: npm install zod

// Define a schema for input validation
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { firstName, lastName, email, password } = body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        // Create default accounts and categories for the new user
        accounts: {
          create: [
            { name: 'Cash', type: 'CASH', balance: 0 },
            { name: 'Bank Account', type: 'SAVINGS', balance: 0 },
          ],
        },
        categories: {
          create: [
            { name: 'Salary', type: 'INCOME' },
            { name: 'Groceries', type: 'EXPENSE' },
            { name: 'Dining Out', type: 'EXPENSE' },
            { name: 'Transportation', type: 'EXPENSE' },
            { name: 'Entertainment', type: 'EXPENSE' },
            { name: 'Utilities', type: 'EXPENSE' },
          ],
        },
      },
    });
    
    // Remove sensitive info
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}